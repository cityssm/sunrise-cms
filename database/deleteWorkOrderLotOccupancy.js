import { acquireConnection } from './pool.js';
export default async function deleteWorkOrderLotOccupancy(workOrderId, lotOccupancyId, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update WorkOrderLotOccupancies
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where workOrderId = ?
        and lotOccupancyId = ?`)
        .run(user.userName, Date.now(), workOrderId, lotOccupancyId);
    database.release();
    return result.changes > 0;
}
