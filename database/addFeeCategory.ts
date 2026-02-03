import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddFeeCategoryForm {
  feeCategory: string
  isGroupedFee?: '1'
  orderNumber?: number
}

export default function addFeeCategory(
  feeCategoryForm: AddFeeCategoryForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        FeeCategories (
          feeCategory,
          isGroupedFee,
          orderNumber,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      feeCategoryForm.feeCategory,
      (feeCategoryForm.isGroupedFee ?? '') === '1' ? 1 : 0,
      feeCategoryForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  if (connectedDatabase === undefined) {
    database.close()
  }
  return result.lastInsertRowid as number
}
