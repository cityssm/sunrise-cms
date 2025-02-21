import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
export default async function addContractTypePrint(addForm, user) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    let result = database
        .prepare(`update ContractTypePrints
        set recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_userName = null,
        recordDelete_timeMillis = null
        where contractTypeId = ?
        and printEJS = ?`)
        .run(user.userName, rightNowMillis, addForm.contractTypeId, addForm.printEJS);
    if (result.changes === 0) {
        result = database
            .prepare(`insert into ContractTypePrints (
          contractTypeId, printEJS, orderNumber,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`)
            .run(addForm.contractTypeId, addForm.printEJS, addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    database.release();
    clearCacheByTableName('ContractTypePrints');
    return result.changes > 0;
}
