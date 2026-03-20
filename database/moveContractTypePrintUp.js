import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export function moveContractTypePrintUp(contractTypeId, printEJS, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentOrderNumber = database
        .prepare(/* sql */ `
        SELECT
          orderNumber
        FROM
          ContractTypePrints
        WHERE
          contractTypeId = ?
          AND printEJS = ?
      `)
        .get(contractTypeId, printEJS).orderNumber;
    if (currentOrderNumber <= 0) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return true;
    }
    database
        .prepare(/* sql */ `
      UPDATE ContractTypePrints
      SET
        orderNumber = orderNumber + 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractTypeId = ?
        AND orderNumber = ? - 1
    `)
        .run(contractTypeId, currentOrderNumber);
    const result = database
        .prepare(/* sql */ `
      UPDATE ContractTypePrints
      SET
        orderNumber = ? - 1
      WHERE
        contractTypeId = ?
        AND printEJS = ?
    `)
        .run(currentOrderNumber, contractTypeId, printEJS);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('ContractTypePrints');
    return result.changes > 0;
}
export function moveContractTypePrintUpToTop(contractTypeId, printEJS, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentOrderNumber = database
        .prepare(/* sql */ `
        SELECT
          orderNumber
        FROM
          ContractTypePrints
        WHERE
          contractTypeId = ?
          AND printEJS = ?
      `)
        .get(contractTypeId, printEJS).orderNumber;
    if (currentOrderNumber > 0) {
        database
            .prepare(/* sql */ `
        UPDATE ContractTypePrints
        SET
          orderNumber = -1
        WHERE
          contractTypeId = ?
          AND printEJS = ?
      `)
            .run(contractTypeId, printEJS);
        database
            .prepare(/* sql */ `
        UPDATE ContractTypePrints
        SET
          orderNumber = orderNumber + 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND contractTypeId = ?
          AND orderNumber < ?
      `)
            .run(contractTypeId, currentOrderNumber);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('ContractTypePrints');
    return true;
}
export default moveContractTypePrintUp;
