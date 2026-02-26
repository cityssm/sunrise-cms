import type { Request, Response } from 'express'

import getBurialSiteDeceasedNames from '../../database/getBurialSiteDeceasedNames.js'
import getBurialSites, {
  type GetBurialSitesFilters
} from '../../database/getBurialSites.js'

import type { BurialSite } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoSearchBurialSitesForGpsResponse =
  | { burialSites: Array<BurialSite & { deceasedNames: string[] }>; success: true }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<unknown, unknown, GetBurialSitesFilters>,
  response: Response<DoSearchBurialSitesForGpsResponse>
): void {
  const filters = request.body

  // Cemetery is required
  if ((filters.cemeteryId ?? '') === '') {
    response.json({
      errorMessage: 'Cemetery selection is required',
      success: false
    })

    return
  }

  // Get burial sites
  const result = getBurialSites(request.body, {
    limit: 500,
    offset: 0,

    includeContractCount: false
  })

  // Filter by coordinate status if specified
  const burialSites = result.burialSites

  // Get interment names for burial sites with active contracts
  const burialSiteInterments = getBurialSiteDeceasedNames(
    burialSites.map((site) => site.burialSiteId)
  )

  // Add interment names to burial sites
  const burialSitesWithDeceasedNames = burialSites.map((site) => ({
    ...site,
    deceasedNames:
      burialSiteInterments.find((bi) => bi.burialSiteId === site.burialSiteId)
        ?.deceasedNames ?? []
  }))

  response.json({
    burialSites: burialSitesWithDeceasedNames,
    success: true
  })
}
