import type { PoolConnection } from 'better-sqlite-pool'

import type { ContractFee } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getContractFees(
  contractId: number | string,
  connectedDatabase?: PoolConnection
): Promise<ContractFee[]> {
  const database = connectedDatabase ?? (await acquireConnection())

  const fees = database
    .prepare(
      `select o.contractId, o.feeId,
        c.feeCategory, f.feeName,
        f.includeQuantity, o.feeAmount, o.taxAmount, o.quantity, f.quantityUnit
        from ContractFees o
        left join Fees f on o.feeId = f.feeId
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        where o.recordDelete_timeMillis is null
        and o.contractId = ?
        order by o.recordCreate_timeMillis`
    )
    .all(contractId) as ContractFee[]

  if (connectedDatabase === undefined) {
    database.release()
  }

  return fees
}
