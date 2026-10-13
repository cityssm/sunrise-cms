import { getDatabaseConnection } from '../../../helpers/database.helpers.js'

export default function updateOrderFormSyncMillis(
  orderFormKey: string,
  syncTimeMillis: number
): boolean {
  const database = getDatabaseConnection()

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
