import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { DatabaseUser } from '../types/record.types.js'

export default function getUsers(
  connectedDatabase?: DatabaseSync
): DatabaseUser[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

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
