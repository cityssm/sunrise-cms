import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../../../helpers/database.helpers.js'

export default function updateOrderFormSyncMillis(
  orderFormKey: string,
  syncTimeMillis: number
): boolean {
  const database = new DatabaseSync(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE OrderForms
      SET
        recordSync_timeMillis = ?
      WHERE
        orderFormKey = ?
    `)
    .run(syncTimeMillis, orderFormKey)

  database.close()

  return result.changes > 0
}
