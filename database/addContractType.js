import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { clearCacheByTableName } from '../helpers/functions.cache.js';
export default function addContractType(addForm, user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into ContractTypes (
        contractType, isPreneed, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.contractType, addForm.isPreneed === undefined ? 0 : 1, addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    database.close();
    clearCacheByTableName('ContractTypes');
    return result.lastInsertRowid;
}
