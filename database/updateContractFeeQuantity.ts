import { acquireConnection } from './pool.js'

export interface UpdateBurialSiteFeeForm {
  contractId: number | string
  feeId: number | string
  quantity: number | string
}

export default async function updateContractFeeQuantity(
  feeQuantityForm: UpdateBurialSiteFeeForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update ContractFees
        set quantity = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and contractId = ?
        and feeId = ?`
    )
    .run(
      feeQuantityForm.quantity,
      user.userName,
      Date.now(),
      feeQuantityForm.contractId,
      feeQuantityForm.feeId
    )

  database.release()

  return result.changes > 0
}
