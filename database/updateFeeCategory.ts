import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateFeeCategoryForm {
  feeCategoryId: number | string

  feeCategory: string
  isGroupedFee?: '1'
}

export default function updateFeeCategory(
  feeCategoryForm: UpdateFeeCategoryForm,
  user: User
, connectedDatabase?: sqlite.Database): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

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

  if (connectedDatabase === undefined) {


    database.close()


  }
  return result.changes > 0
}
