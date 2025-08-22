import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteContractTypePrint(contractTypeId, printEJS, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(`update ContractTypePrints
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractTypeId = ?
        and printEJS = ?`)
        .run(user.userName, Date.now(), contractTypeId, printEJS);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('ContractTypePrints');
    return result.changes > 0;
}
