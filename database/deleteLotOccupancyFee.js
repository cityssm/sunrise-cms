import { acquireConnection } from './pool.js';
export default async function deleteLotOccupancyFee(lotOccupancyId, feeId, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update LotOccupancyFees
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where lotOccupancyId = ?
        and feeId = ?`)
        .run(user.userName, Date.now(), lotOccupancyId, feeId);
    database.release();
    return result.changes > 0;
}
