import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export function deleteLocalUser(
  userId: number,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `UPDATE Users SET 
       recordDelete_userName = ?, recordDelete_timeMillis = ?
       WHERE userId = ? AND recordDelete_timeMillis IS NULL`
    )
    .run(user.userName, rightNowMillis, userId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

export default deleteLocalUser