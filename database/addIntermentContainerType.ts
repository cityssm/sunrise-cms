import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import { clearCacheByTableName } from '../helpers/functions.cache.js'

export interface AddIntermentContainerTypeForm {
  intermentContainerType: string
  intermentContainerTypeKey?: string
  isCremationType?: '0' | '1'
  orderNumber?: number | string
}

export default function addIntermentContainerType(
  addForm: AddIntermentContainerTypeForm,
  user: User
): number {
  const database = sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into IntermentContainerTypes (
        intermentContainerType, intermentContainerTypeKey, isCremationType, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.intermentContainerType,
      addForm.intermentContainerTypeKey ?? '',
      addForm.isCremationType ?? '0',
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.close()

  clearCacheByTableName('IntermentContainerTypes')

  return result.lastInsertRowid as number
}
