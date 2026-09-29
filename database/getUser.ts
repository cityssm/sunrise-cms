import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { DatabaseUser } from '../types/record.types.js'

export default function getUser(
  username: string,
  connectedDatabase?: DatabaseSync
): DatabaseUser | undefined {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const user = database
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
        username = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .get(username) as DatabaseUser | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return user
}
