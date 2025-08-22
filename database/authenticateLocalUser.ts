import sqlite from 'better-sqlite3'
import bcrypt from 'bcrypt'

import { sunriseDB } from '../helpers/database.helpers.js'

export function authenticateLocalUser(
  userName: string,
  password: string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const user = database
    .prepare(
      `SELECT passwordHash
       FROM Users
       WHERE userName = ? AND isActive = 1 AND recordDelete_timeMillis IS NULL`
    )
    .get(userName) as { passwordHash: string } | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  if (!user || !user.passwordHash) {
    return false
  }

  return bcrypt.compareSync(password, user.passwordHash)
}

export default authenticateLocalUser