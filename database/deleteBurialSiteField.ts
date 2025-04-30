import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteBurialSiteField(
  burialSiteId: number | string,
  burialSiteTypeFieldId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(
      `update BurialSiteFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where burialSiteId = ?
          and burialSiteTypeFieldId = ?`
    )
    .run(user.userName, Date.now(), burialSiteId, burialSiteTypeFieldId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
