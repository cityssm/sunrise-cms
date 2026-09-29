import { DatabaseSync } from 'node:sqlite';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteContractTypePrint(contractTypeId, printEJS, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const result = database
        .prepare(`
      UPDATE ContractTypePrints
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractTypeId = ?
        AND printEJS = ?
    `)
        .run(user.username, Date.now(), contractTypeId, printEJS);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('ContractTypePrints');
    return result.changes > 0;
}
