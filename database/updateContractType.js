import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { clearCacheByTableName } from '../helpers/functions.cache.js';
export default function updateContractType(updateForm, user) {
    const database = sqlite(sunriseDB);
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
    database.close();
    clearCacheByTableName('ContractTypes');
    return result.changes > 0;
}
