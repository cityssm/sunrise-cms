import type { Request, Response } from 'express'

import getContracts, {
  type GetContractsFilters,
  type GetContractsOptions
} from '../../database/getContracts.js'

export default async function handler(
  request: Request<unknown, unknown, GetContractsFilters & GetContractsOptions>,
  response: Response
): Promise<void> {
  const result = await getContracts(request.body, {
    limit: request.body.limit,
    offset: request.body.offset,

    includeFees: true,
    includeInterments: true,
    includeTransactions: true
  })

  response.json({
    contracts: result.contracts,
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Number.parseInt(request.body.offset, 10)
        : request.body.offset
  })
}
