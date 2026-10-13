import { getDatabaseConnection } from '../../../helpers/database.helpers.js';
export default function updateOrderFormSyncMillis(orderFormKey, syncTimeMillis) {
    const database = getDatabaseConnection();
    const result = database
        .prepare(`
      UPDATE OrderForms
      SET
        recordSync_timeMillis = ?
      WHERE
        orderFormKey = ?
    `)
        .run(syncTimeMillis, orderFormKey);
    database.close();
    return result.changes > 0;
}
