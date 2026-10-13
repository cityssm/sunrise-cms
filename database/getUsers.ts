import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { DatabaseUser } from '../types/record.types.js'

export default function getUsers(
  connectedDatabase?: DatabaseSync
): DatabaseUser[] {
  const database =
    connectedDatabase ?? getDatabaseConnection(true)

  const users = database
    .prepare(/* sql */ `
      SELECT
        username,
        isActive,
        canUpdateCemeteries,
        canUpdateContracts,
        canUpdateWorkOrders,
        isAdmin,
        recordCreate_username,
        recordCreate_timeMillis,
        recordUpdate_username,
        recordUpdate_timeMillis
      FROM
        Users
      WHERE
        recordDelete_timeMillis IS NULL
      ORDER BY
        username
    `)
    .all() as unknown as DatabaseUser[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return users
}
