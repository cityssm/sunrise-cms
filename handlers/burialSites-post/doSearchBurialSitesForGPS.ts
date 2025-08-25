import type { Request, Response } from 'express'
import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import getBurialSites from '../../database/getBurialSites.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

interface BurialSiteInterment {
  burialSiteId: number
  deceasedNames: string[]
}

export default function handler(request: Request, response: Response): void {
  const filters = request.body as {
    cemeteryId?: string
    burialSiteTypeId?: string
    coordinateStatus?: string
    burialSiteName?: string
  }

  // Cemetery is required
  if (!filters.cemeteryId) {
    response.json({
      success: false,
      errorMessage: 'Cemetery selection is required'
    })
    return
  }

  // Build search filters
  const searchFilters: any = {
    cemeteryId: Number.parseInt(filters.cemeteryId, 10)
  }

  // Add burial site type filter if provided
  if (filters.burialSiteTypeId) {
    searchFilters.burialSiteTypeId = Number.parseInt(filters.burialSiteTypeId, 10)
  }

  // Add burial site name filter if provided
  if (filters.burialSiteName && filters.burialSiteName.trim()) {
    searchFilters.burialSiteName = filters.burialSiteName.trim()
  }

  // Get burial sites
  const result = getBurialSites(
    searchFilters,
    {
      limit: 500, // Reasonable limit for GPS capture
      offset: 0,
      includeContractCount: false
    }
  )

  // Filter by coordinate status if specified
  let burialSites = result.burialSites
  if (filters.coordinateStatus === 'missing') {
    burialSites = burialSites.filter(site => !site.burialSiteLatitude || !site.burialSiteLongitude)
  } else if (filters.coordinateStatus === 'present') {
    burialSites = burialSites.filter(site => site.burialSiteLatitude && site.burialSiteLongitude)
  }

  // Get interment names for burial sites with active contracts
  const burialSiteInterments = getBurialSiteInterments(burialSites.map(site => site.burialSiteId))

  // Add interment names to burial sites
  const burialSitesWithInterments = burialSites.map(site => ({
    ...site,
    intermentNames: burialSiteInterments.find(bi => bi.burialSiteId === site.burialSiteId)?.deceasedNames || []
  }))

  response.json({
    success: true,
    burialSites: burialSitesWithInterments
  })
}

function getBurialSiteInterments(burialSiteIds: number[]): BurialSiteInterment[] {
  if (burialSiteIds.length === 0) {
    return []
  }

  const database = sqlite(sunriseDB, { readonly: true })
  const currentDate = dateToInteger(new Date())

  try {
    // Create placeholders for the IN clause
    const placeholders = burialSiteIds.map(() => '?').join(',')
    
    // Get deceased names for burial sites with active contracts
    const rows = database
      .prepare(
        `SELECT c.burialSiteId, ci.deceasedName
         FROM Contracts c
         INNER JOIN ContractInterments ci ON c.contractId = ci.contractId
         WHERE c.recordDelete_timeMillis IS NULL
         AND ci.recordDelete_timeMillis IS NULL
         AND c.burialSiteId IS NOT NULL
         AND c.burialSiteId IN (${placeholders})
         AND c.contractStartDate <= ?
         AND (c.contractEndDate IS NULL OR c.contractEndDate >= ?)
         ORDER BY c.burialSiteId, ci.deceasedName`
      )
      .all(...burialSiteIds, currentDate, currentDate) as Array<{ burialSiteId: number; deceasedName: string }>

    // Group deceased names by burial site
    const intermentMap = new Map<number, string[]>()
    
    for (const row of rows) {
      if (!intermentMap.has(row.burialSiteId)) {
        intermentMap.set(row.burialSiteId, [])
      }
      intermentMap.get(row.burialSiteId)!.push(row.deceasedName)
    }

    return Array.from(intermentMap.entries()).map(([burialSiteId, deceasedNames]) => ({
      burialSiteId,
      deceasedNames
    }))
  } finally {
    database.close()
  }
}