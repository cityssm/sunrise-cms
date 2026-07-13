import type { Request, Response } from 'express'

import getContracts, {
  type GetContractsFilters,
  type GetContractsOptions
} from '../../database/getContracts.js'
import type { Contract } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
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
    includeServiceTypes: true,
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
