import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { DatabaseUser } from '../types/record.types.js'

export default function getUser(
  username: string,
  connectedDatabase?: sqlite.Database
): DatabaseUser | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const user = database
    .prepare(/* sql */ `
      SELECT
        userName AS username,
        isActive,
        canUpdateCemeteries,
        canUpdateContracts,
        canUpdateWorkOrders,
        isAdmin,
        recordCreate_userName AS recordCreate_username,
        recordCreate_timeMillis,
        recordUpdate_userName AS recordUpdate_username,
        recordUpdate_timeMillis
      FROM
        Users
      WHERE
        userName = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .get(username) as DatabaseUser | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return user
}
