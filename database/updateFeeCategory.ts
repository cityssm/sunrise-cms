import { acquireConnection } from './pool.js'

export interface UpdateFeeCategoryForm {
  feeCategoryId: number | string
  
  feeCategory: string
  isGroupedFee?: '1'
}

export default async function updateFeeCategory(
  feeCategoryForm: UpdateFeeCategoryForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update FeeCategories
        set feeCategory = ?,
        isGroupedFee = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and feeCategoryId = ?`
    )
    .run(
      feeCategoryForm.feeCategory,
      (feeCategoryForm.isGroupedFee ?? '') === '1' ? 1 : 0,
      user.userName,
      Date.now(),
      feeCategoryForm.feeCategoryId
    )

  database.release()

  return result.changes > 0
}
