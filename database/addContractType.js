import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
export default async function addContractType(addForm, user) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into ContractTypes (
        contractType, isPreneed, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.contractType, addForm.isPreneed === undefined ? 0 : 1, addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    database.release();
    clearCacheByTableName('ContractTypes');
    return result.lastInsertRowid;
}
