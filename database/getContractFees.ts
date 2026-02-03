import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractFee } from '../types/record.types.js'

export default function getContractFees(
  contractId: number | string,
  connectedDatabase?: sqlite.Database
): ContractFee[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const fees = database
    .prepare(/* sql */ `select cf.contractId, cf.feeId,
        c.feeCategory, f.feeName,
        f.includeQuantity, cf.feeAmount, cf.taxAmount, cf.quantity, f.quantityUnit
        from ContractFees cf
        left join Fees f on cf.feeId = f.feeId
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        where cf.recordDelete_timeMillis is null
        and cf.contractId = ?
        order by cf.recordCreate_timeMillis`
    )
    .all(contractId) as ContractFee[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return fees
}
