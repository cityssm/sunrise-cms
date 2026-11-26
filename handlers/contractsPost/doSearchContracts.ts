import type { Request, Response } from 'express'

import getContracts, {
  type GetContractsFilters,
  type GetContractsOptions
} from '../../database/getContracts.js'
import type { Contract } from '../../types/record.types.js'

export type DoSearchContractsResponse = {
  contracts: Contract[]
  count: number
  offset: number
}

export default async function handler(
  request: Request<unknown, unknown, GetContractsFilters & GetContractsOptions>,
  response: Response<DoSearchContractsResponse>
): Promise<void> {
  const result = await getContracts(request.body, {
    limit: request.body.limit,
    offset: request.body.offset,

    includeFees: true,
    includeInterments: true,
    includeOpenWorkOrders: true,
    includeServiceTypes: true,
    includeTransactions: true
  })

  response.json({
    contracts: result.contracts,
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Math.trunc(Number(request.body.offset))
        : request.body.offset
  })
}
