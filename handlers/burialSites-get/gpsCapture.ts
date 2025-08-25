import type { Request, Response } from 'express'
import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import getBurialSites from '../../database/getBurialSites.js'
import getCemeteries from '../../database/getCemeteries.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

interface BurialSiteInterment {
  burialSiteId: number
  deceasedNames: string[]
}

export default function handler(request: Request, response: Response): void {
  const cemeteries = getCemeteries()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const burialSiteStatuses = getCachedBurialSiteStatuses()

  // Get all burial sites for GPS capture
  const result = getBurialSites(
    {},
    {
      limit: 1000, // Get a large number of burial sites
      offset: 0,
      includeContractCount: false
    }
  )

  // Get interment names for burial sites with active contracts
  const burialSiteInterments = getBurialSiteInterments()

  // Add interment names to burial sites
  const burialSitesWithInterments = result.burialSites.map(site => ({
    ...site,
    intermentNames: burialSiteInterments.find(bi => bi.burialSiteId === site.burialSiteId)?.deceasedNames || []
  }))

  response.render('burialSite-gpsCapture', {
    headTitle: 'GPS Coordinate Capture',
    
    burialSites: burialSitesWithInterments,
    burialSiteStatuses,
    burialSiteTypes,
    cemeteries,
    
    cemeteryId: request.query.cemeteryId,
    burialSiteTypeId: request.query.burialSiteTypeId
  })
}

function getBurialSiteInterments(): BurialSiteInterment[] {
  const database = sqlite(sunriseDB, { readonly: true })
  const currentDate = dateToInteger(new Date())

  try {
    // Get deceased names for burial sites with active contracts
    const rows = database
      .prepare(
        `SELECT c.burialSiteId, ci.deceasedName
         FROM Contracts c
         INNER JOIN ContractInterments ci ON c.contractId = ci.contractId
         WHERE c.recordDelete_timeMillis IS NULL
         AND ci.recordDelete_timeMillis IS NULL
         AND c.burialSiteId IS NOT NULL
         AND c.contractStartDate <= ?
         AND (c.contractEndDate IS NULL OR c.contractEndDate >= ?)
         ORDER BY c.burialSiteId, ci.deceasedName`
      )
      .all(currentDate, currentDate) as Array<{ burialSiteId: number; deceasedName: string }>

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