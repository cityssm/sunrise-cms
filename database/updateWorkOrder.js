import { dateStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateWorkOrder(workOrderForm, user) {
    const database = sqlite(sunriseDB);
    const result = database
        .prepare(`update WorkOrders
        set workOrderNumber = ?,
          workOrderTypeId = ?,
          workOrderDescription = ?,
          workOrderOpenDate = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where workOrderId = ?
          and recordDelete_timeMillis is null`)
        .run(workOrderForm.workOrderNumber, workOrderForm.workOrderTypeId, workOrderForm.workOrderDescription, dateStringToInteger(workOrderForm.workOrderOpenDateString), user.userName, Date.now(), workOrderForm.workOrderId);
    database.close();
    return result.changes > 0;
}
