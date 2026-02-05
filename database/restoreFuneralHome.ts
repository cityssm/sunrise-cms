import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export function restoreFuneralHome(
  funeralHomeId: number,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      UPDATE FuneralHomes
      SET
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        funeralHomeId = ?
        AND recordDelete_timeMillis IS NOT NULL
    `)
    .run(user.userName, rightNowMillis, funeralHomeId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
