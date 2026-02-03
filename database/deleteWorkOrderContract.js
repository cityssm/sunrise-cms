import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteWorkOrderContract(workOrderId, contractId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(/* sql */ `update WorkOrderContracts
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where workOrderId = ?
        and contractId = ?`)
        .run(user.userName, Date.now(), workOrderId, contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
