import type { Request, Response } from 'express'

import getBurialSiteContracts, {
  type GetBurialSiteContractsFilters,
  type GetBurialSiteContractsOptions
} from '../../database/getBurialSiteContracts.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    GetBurialSiteContractsFilters & GetBurialSiteContractsOptions
  >,
  response: Response
): Promise<void> {
  const result = await getBurialSiteContracts(request.body, {
    limit: request.body.limit,
    offset: request.body.offset,
    includeInterments: true,
    includeFees: true,
    includeTransactions: true
  })

  response.json({
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Number.parseInt(request.body.offset, 10)
        : request.body.offset,
    burialSiteContracts: result.burialSiteContracts
  })
}
