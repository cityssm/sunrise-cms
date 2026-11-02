import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'

export default function updateOrderFormProcessed(
  orderFormId: number | string,
  isOrderFormProcessed = true,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? getDatabaseConnection()

  const result = database
    .prepare(/* sql */ `
      UPDATE OrderForms
      SET
        isOrderFormProcessed = ?
      WHERE
        orderFormId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(isOrderFormProcessed ? 1 : 0, Number(orderFormId))

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
