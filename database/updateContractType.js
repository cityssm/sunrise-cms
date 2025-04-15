import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
export default async function updateContractType(updateForm, user) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update ContractTypes
        set contractType = ?,
          isPreneed = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractTypeId = ?`)
        .run(updateForm.contractType, updateForm.isPreneed === undefined ? 0 : 1, user.userName, rightNowMillis, updateForm.contractTypeId);
    database.release();
    clearCacheByTableName('ContractTypes');
    return result.changes > 0;
}
