import { acquireConnection } from './pool.js';
export async function deleteLotField(lotId, lotTypeFieldId, requestSession, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update LotFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where lotId = ?
        and lotTypeFieldId = ?`)
        .run(requestSession.user.userName, rightNowMillis, lotId, lotTypeFieldId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return result.changes > 0;
}
export default deleteLotField;
