import { acquireConnection } from './pool.js';
export async function reopenWorkOrder(workOrderId, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update WorkOrders
        set workOrderCloseDate = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where workOrderId = ?
        and workOrderCloseDate is not null`)
        .run(user.userName, Date.now(), workOrderId);
    database.release();
    return result.changes > 0;
}
export default reopenWorkOrder;
