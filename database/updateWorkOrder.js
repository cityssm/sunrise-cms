import { dateStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateWorkOrder(workOrderForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(/* sql */ `update WorkOrders
        set workOrderNumber = ?,
          workOrderTypeId = ?,
          workOrderDescription = ?,
          workOrderOpenDate = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where workOrderId = ?
          and recordDelete_timeMillis is null`)
        .run(workOrderForm.workOrderNumber, workOrderForm.workOrderTypeId, workOrderForm.workOrderDescription, dateStringToInteger(workOrderForm.workOrderOpenDateString), user.userName, Date.now(), workOrderForm.workOrderId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
