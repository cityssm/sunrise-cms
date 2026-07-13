import type { Request, Response } from 'express'

import getBurialSites, {
  type GetBurialSitesFilters,
  type GetBurialSitesOptions
} from '../../database/getBurialSites.js'
import type { BurialSite } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
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

  response.json({
    burialSites: result.burialSites,
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Number.parseInt(request.body.offset, 10)
        : request.body.offset
  })
}
