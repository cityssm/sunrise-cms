import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
export default async function deleteContractTypePrint(contractTypeId, printEJS, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update ContractTypePrints
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractTypeId = ?
        and printEJS = ?`)
        .run(user.userName, Date.now(), contractTypeId, printEJS);
    database.release();
    clearCacheByTableName('ContractTypePrints');
    return result.changes > 0;
}
