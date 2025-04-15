import { dateStringToInteger } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function updateWorkOrder(workOrderForm, user) {
    const database = await acquireConnection();
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
    database.release();
    return result.changes > 0;
}
