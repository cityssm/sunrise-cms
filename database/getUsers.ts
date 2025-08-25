import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { DatabaseUser } from '../types/record.types.js'

export default function getUsers(
  connectedDatabase?: sqlite.Database
): DatabaseUser[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const users = database
    .prepare(
      `select userName, isActive,
          canUpdateCemeteries, canUpdateContracts, canUpdateWorkOrders, isAdmin,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis
        from Users
        where recordDelete_timeMillis is null
        order by userName`
    )
    .all() as DatabaseUser[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return users
}


