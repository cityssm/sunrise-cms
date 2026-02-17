import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateForm {
  serviceTypeId: number | string
  serviceType: string
}

export default function updateServiceType(
  updateForm: UpdateForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const info = database
    .prepare(/* sql */ `
      UPDATE
        ServiceTypes
      SET
        serviceType = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.serviceType,
      user.userName,
      Date.now(),
      updateForm.serviceTypeId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  const success = info.changes > 0

  if (success) {
    clearCacheByTableName('ServiceTypes')
  }

  return success
}
