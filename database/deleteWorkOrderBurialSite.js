import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteWorkOrderBurialSite(workOrderId, burialSiteId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(/* sql */ `
      UPDATE WorkOrderBurialSites
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        workOrderId = ?
        AND burialSiteId = ?
    `)
        .run(user.userName, Date.now(), workOrderId, burialSiteId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
