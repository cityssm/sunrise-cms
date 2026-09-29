import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateBurialSiteFeeForm {
  contractId: number | string
  feeId: number | string
  quantity: number | string
}

export default function updateContractFeeQuantity(
  feeQuantityForm: UpdateBurialSiteFeeForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractFees
      SET
        quantity = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
        AND feeId = ?
    `)
    .run(
      feeQuantityForm.quantity,
      user.username,
      Date.now(),
      feeQuantityForm.contractId,
      feeQuantityForm.feeId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
