import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'

export default function deleteOrderForm(
  orderFormId: number | string,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? getDatabaseConnection()

  const result = database
    .prepare(/* sql */ `
      UPDATE OrderForms
      SET
        recordDelete_timeMillis = ?,
        recordDelete_username = ?
      WHERE
        orderFormId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(Date.now(), user.username, Number(orderFormId))

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
