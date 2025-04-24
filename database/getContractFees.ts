import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractFee } from '../types/record.types.js'

export default function getContractFees(
  contractId: number | string,
  connectedDatabase?: sqlite.Database
): ContractFee[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

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
    database.close()
  }

  return fees
}
