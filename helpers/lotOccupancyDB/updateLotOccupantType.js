import { clearCacheByTableName } from '../functions.cache.js';
import { acquireConnection } from './pool.js';
export async function updateLotOccupantType(lotOccupantTypeForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update LotOccupantTypes
        set lotOccupantType = ?,
        fontAwesomeIconClass = ?,
        occupantCommentTitle = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where lotOccupantTypeId = ?
        and recordDelete_timeMillis is null`)
        .run(lotOccupantTypeForm.lotOccupantType, lotOccupantTypeForm.fontAwesomeIconClass, lotOccupantTypeForm.occupantCommentTitle, user.userName, Date.now(), lotOccupantTypeForm.lotOccupantTypeId);
    database.release();
    clearCacheByTableName('LotOccupantTypes');
    return result.changes > 0;
}
export default updateLotOccupantType;
