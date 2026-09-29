import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateFeeCategoryForm {
  feeCategoryId: number | string

  feeCategory: string
  isGroupedFee?: '1'
}

export default function updateFeeCategory(
  feeCategoryForm: UpdateFeeCategoryForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE FeeCategories
      SET
        feeCategory = ?,
        isGroupedFee = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND feeCategoryId = ?
    `)
    .run(
      feeCategoryForm.feeCategory,
      (feeCategoryForm.isGroupedFee ?? '') === '1' ? 1 : 0,
      user.username,
      Date.now(),
      feeCategoryForm.feeCategoryId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
