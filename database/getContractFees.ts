import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractFee } from '../types/record.types.js'

export default function getContractFees(
  contractId: number | string,
  connectedDatabase?: DatabaseSync
): ContractFee[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const fees = database
    .prepare(/* sql */ `
      SELECT
        cf.contractId,
        cf.feeId,
        c.feeCategory,
        f.feeName,
        f.includeQuantity,
        cf.feeAmount,
        cf.taxAmount,
        cf.quantity,
        f.quantityUnit
      FROM
        ContractFees cf
        LEFT JOIN Fees f ON cf.feeId = f.feeId
        LEFT JOIN FeeCategories c ON f.feeCategoryId = c.feeCategoryId
      WHERE
        cf.recordDelete_timeMillis IS NULL
        AND cf.contractId = ?
      ORDER BY
        cf.recordCreate_timeMillis
    `)
    .all(contractId) as unknown as ContractFee[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return fees
}
