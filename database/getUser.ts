import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { DatabaseUser } from '../types/record.types.js'

export default function getUser(
  userName: string,
  connectedDatabase?: sqlite.Database
): DatabaseUser | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const user = database
    .prepare(/* sql */ `
      SELECT
        userName,
        isActive,
        canUpdateCemeteries,
        canUpdateContracts,
        canUpdateWorkOrders,
        isAdmin,
        recordCreate_userName,
        recordCreate_timeMillis,
        recordUpdate_userName,
        recordUpdate_timeMillis
      FROM
        Users
      WHERE
        userName = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .get(userName) as DatabaseUser | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return user
}
