import { acquireConnection } from './pool.js';
import { dateStringToInteger, dateToInteger } from '@cityssm/utils-datetime';
export async function closeWorkOrder(workOrderForm, requestSession) {
    const database = await acquireConnection();
    const rightNow = new Date();
    const result = database
        .prepare(`update WorkOrders
        set workOrderCloseDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where workOrderId = ?`)
        .run(workOrderForm.workOrderCloseDateString
        ? dateStringToInteger(workOrderForm.workOrderCloseDateString)
        : dateToInteger(new Date()), requestSession.user.userName, rightNow.getTime(), workOrderForm.workOrderId);
    database.release();
    return result.changes > 0;
}
export default closeWorkOrder;
