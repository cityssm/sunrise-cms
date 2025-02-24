import { acquireConnection } from './pool.js'

export interface UpdateBurialSiteFeeForm {
  burialSiteContractId: string | number
  feeId: string | number
  quantity: string | number
}

export default async function updateBurialSiteContractFeeQuantity(
  feeQuantityForm: UpdateBurialSiteFeeForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update BurialSiteContractFees
        set quantity = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
        and feeId = ?`
    )
    .run(
      feeQuantityForm.quantity,
      user.userName,
      Date.now(),
      feeQuantityForm.burialSiteContractId,
      feeQuantityForm.feeId
    )

  database.release()

  return result.changes > 0
}
