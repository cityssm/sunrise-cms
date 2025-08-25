import type { Request, Response } from 'express'

import getBurialSiteInterments from '../../database/getBurialSiteInterments.js'
import getBurialSites, { type GetBurialSitesFilters } from '../../database/getBurialSites.js'

export default function handler(request: Request<unknown, unknown, GetBurialSitesFilters>, response: Response): void {
  const filters = request.body

  // Cemetery is required
  if (!filters.cemeteryId) {
    response.json({
      errorMessage: 'Cemetery selection is required',
      success: false
    })

    return
  }

  // Get burial sites
  const result = getBurialSites(
    request.body,
    {
      limit: 500,
      offset: 0,

      includeContractCount: false
    }
  )

  // Filter by coordinate status if specified
  const burialSites = result.burialSites

  // Get interment names for burial sites with active contracts
  const burialSiteInterments = getBurialSiteInterments(burialSites.map(site => site.burialSiteId))

  // Add interment names to burial sites
  const burialSitesWithInterments = burialSites.map(site => ({
    ...site,
    intermentNames: burialSiteInterments.find(bi => bi.burialSiteId === site.burialSiteId)?.deceasedNames ?? []
  }))

  response.json({
    burialSites: burialSitesWithInterments,
    success: true
  })
}
