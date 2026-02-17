import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteServiceType(
  serviceTypeId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const info = database
    .prepare(/* sql */ `
      UPDATE
        ServiceTypes
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, serviceTypeId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  const success = info.changes > 0

  if (success) {
    clearCacheByTableName('ServiceTypes')
  }

  return success
}
