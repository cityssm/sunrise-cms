import type { Request, Response } from 'express'

import getBurialSites, {
  type GetBurialSitesFilters,
  type GetBurialSitesOptions
} from '../../database/getBurialSites.js'
import type { BurialSite } from '../../types/record.types.js'

export type DoSearchBurialSitesResponse = {
  burialSites: BurialSite[]
  count: number
  offset: number
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    GetBurialSitesFilters & GetBurialSitesOptions
  >,
  response: Response<DoSearchBurialSitesResponse>
): void {
  const result = getBurialSites(request.body, {
    limit: request.body.limit,
    offset: request.body.offset,

    includeContractCount: true
  })

  for (const burialSite of result.burialSites) {
    burialSite.setBodyCapacity =
      burialSite.bodyCapacity ?? burialSite.bodyCapacityMax ?? undefined

    burialSite.setCrematedCapacity =
      burialSite.crematedCapacity ?? burialSite.crematedCapacityMax ?? undefined
  }

  response.json({
    burialSites: result.burialSites,
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Math.trunc(Number(request.body.offset))
        : request.body.offset
  })
}
