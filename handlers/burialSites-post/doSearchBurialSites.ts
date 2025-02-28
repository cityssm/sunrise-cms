import type { Request, Response } from 'express'

import getBurialSites, {
  type GetBurialSitesFilters,
  type GetBurialSitesOptions
} from '../../database/getBurialSites.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    GetBurialSitesFilters & GetBurialSitesOptions
  >,
  response: Response
): Promise<void> {
  const result = await getBurialSites(request.body, {
    limit: request.body.limit,
    offset: request.body.offset,
    includeContractCount: true
  })

  response.json({
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Number.parseInt(request.body.offset, 10)
        : request.body.offset,
    burialSites: result.burialSites
  })
}
