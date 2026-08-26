import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addContractTypePrint(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    let result = database
        .prepare(`
      UPDATE ContractTypePrints
      SET
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        contractTypeId = ?
        AND printEJS = ?
    `)
        .run(user.username, rightNowMillis, addForm.contractTypeId, addForm.printEJS);
    if (result.changes === 0) {
        result = database
            .prepare(`
        INSERT INTO
          ContractTypePrints (
            contractTypeId,
            printEJS,
            orderNumber,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
            .run(addForm.contractTypeId, addForm.printEJS, addForm.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('ContractTypePrints');
    return result.changes > 0;
}
