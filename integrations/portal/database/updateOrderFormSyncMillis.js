import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../../../helpers/database.helpers.js';
export default function updateOrderFormSyncMillis(orderFormKey, syncTimeMillis) {
    const database = new DatabaseSync(sunriseDB);
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
