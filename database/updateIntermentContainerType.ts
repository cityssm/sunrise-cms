import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateIntermentContainerTypeForm {
  intermentContainerTypeId: number | string

  intermentContainerType: string
  isCremationType: '0' | '1'
}

export default function updateIntermentContainerType(
  updateForm: UpdateIntermentContainerTypeForm,
  user: User
, connectedDatabase?: sqlite.Database): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `update IntermentContainerTypes
        set intermentContainerType = ?,
          isCremationType = ?,
          recordUpdate_userName = ?, recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and intermentContainerTypeId = ?`
    )
    .run(
      updateForm.intermentContainerType,
      updateForm.isCremationType,
      user.userName,
      rightNowMillis,
      updateForm.intermentContainerTypeId
    )

  if (connectedDatabase === undefined) {


    database.close()


  }
  clearCacheByTableName('IntermentContainerTypes')

  return result.changes > 0
}
