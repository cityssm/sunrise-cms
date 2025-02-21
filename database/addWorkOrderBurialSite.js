import { acquireConnection } from './pool.js';
export default async function addWorkOrderLot(workOrderLotForm, user) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    const row = database
        .prepare(`select recordDelete_timeMillis
        from WorkOrderLots
        where workOrderId = ?
        and lotId = ?`)
        .get(workOrderLotForm.workOrderId, workOrderLotForm.lotId);
    if (row === undefined) {
        database
            .prepare(`insert into WorkOrderLots (
          workOrderId, lotId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?)`)
            .run(workOrderLotForm.workOrderId, workOrderLotForm.lotId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    else {
        if (row.recordDelete_timeMillis) {
            database
                .prepare(`update WorkOrderLots
            set recordCreate_userName = ?,
            recordCreate_timeMillis = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?,
            recordDelete_userName = null,
            recordDelete_timeMillis = null
            where workOrderId = ?
            and lotId = ?`)
                .run(user.userName, rightNowMillis, user.userName, rightNowMillis, workOrderLotForm.workOrderId, workOrderLotForm.lotId);
        }
    }
    database.release();
    return true;
}
