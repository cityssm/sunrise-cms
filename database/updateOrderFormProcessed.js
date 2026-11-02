import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function updateOrderFormProcessed(orderFormId, isOrderFormProcessed = true, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const result = database
        .prepare(`
      UPDATE OrderForms
      SET
        isOrderFormProcessed = ?
      WHERE
        orderFormId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(isOrderFormProcessed ? 1 : 0, Number(orderFormId));
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
