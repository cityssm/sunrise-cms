import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import { clearCacheByTableName } from '../helpers/functions.cache.js'

export interface AddForm {
  committalType: string
  committalTypeKey?: string
  orderNumber?: number
}

export default function addCommittalType(addForm: AddForm, user: User): number {
  const database = sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into CommittalTypes (
        committalType, committalTypeKey, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.committalType,
      addForm.committalTypeKey ?? '',
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.close()

  clearCacheByTableName('CommittalTypes')

  return result.lastInsertRowid as number
}
