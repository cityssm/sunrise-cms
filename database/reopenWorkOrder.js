import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function reopenWorkOrder(workOrderId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(/* sql */ `
      UPDATE WorkOrders
      SET
        workOrderCloseDate = NULL,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderId = ?
        AND workOrderCloseDate IS NOT NULL
    `)
        .run(user.userName, Date.now(), workOrderId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
