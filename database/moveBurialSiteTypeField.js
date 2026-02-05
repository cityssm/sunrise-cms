import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export function moveBurialSiteTypeFieldDown(burialSiteTypeFieldId) {
    const database = sqlite(sunriseDB);
    const currentField = getCurrentField(burialSiteTypeFieldId, database);
    database
        .prepare(/* sql */ `
      UPDATE BurialSiteTypeFields
      SET
        orderNumber = orderNumber - 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId = ?
        AND orderNumber = ? + 1
    `)
        .run(currentField.burialSiteTypeId, currentField.orderNumber);
    const success = updateRecordOrderNumber('BurialSiteTypeFields', burialSiteTypeFieldId, currentField.orderNumber + 1, database);
    database.close();
    clearCacheByTableName('BurialSiteTypeFields');
    return success;
}
export function moveBurialSiteTypeFieldDownToBottom(burialSiteTypeFieldId) {
    const database = sqlite(sunriseDB);
    const currentField = getCurrentField(burialSiteTypeFieldId, database);
    const maxOrderNumber = database
        .prepare(/* sql */ `
        SELECT
          max(orderNumber) AS maxOrderNumber
        FROM
          BurialSiteTypeFields
        WHERE
          recordDelete_timeMillis IS NULL
          AND burialSiteTypeId = ?
      `)
        .get(currentField.burialSiteTypeId).maxOrderNumber;
    if (currentField.orderNumber !== maxOrderNumber) {
        updateRecordOrderNumber('BurialSiteTypeFields', burialSiteTypeFieldId, maxOrderNumber + 1, database);
        database
            .prepare(/* sql */ `
        UPDATE BurialSiteTypeFields
        SET
          orderNumber = orderNumber - 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND burialSiteTypeId = ?
          AND orderNumber > ?
      `)
            .run(currentField.burialSiteTypeId, currentField.orderNumber);
    }
    database.close();
    clearCacheByTableName('BurialSiteTypeFields');
    return true;
}
export function moveBurialSiteTypeFieldUp(burialSiteTypeFieldId) {
    const database = sqlite(sunriseDB);
    const currentField = getCurrentField(burialSiteTypeFieldId, database);
    if (currentField.orderNumber <= 0) {
        database.close();
        return true;
    }
    database
        .prepare(/* sql */ `
      UPDATE BurialSiteTypeFields
      SET
        orderNumber = orderNumber + 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId = ?
        AND orderNumber = ? - 1
    `)
        .run(currentField.burialSiteTypeId, currentField.orderNumber);
    const success = updateRecordOrderNumber('BurialSiteTypeFields', burialSiteTypeFieldId, currentField.orderNumber - 1, database);
    database.close();
    clearCacheByTableName('BurialSiteTypeFields');
    return success;
}
export function moveBurialSiteTypeFieldUpToTop(burialSiteTypeFieldId) {
    const database = sqlite(sunriseDB);
    const currentField = getCurrentField(burialSiteTypeFieldId, database);
    if (currentField.orderNumber > 0) {
        updateRecordOrderNumber('BurialSiteTypeFields', burialSiteTypeFieldId, -1, database);
        database
            .prepare(/* sql */ `
        UPDATE BurialSiteTypeFields
        SET
          orderNumber = orderNumber + 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND burialSiteTypeId = ?
          AND orderNumber < ?
      `)
            .run(currentField.burialSiteTypeId, currentField.orderNumber);
    }
    database.close();
    clearCacheByTableName('BurialSiteTypeFields');
    return true;
}
function getCurrentField(burialSiteTypeFieldId, connectedDatabase) {
    return connectedDatabase
        .prepare('select burialSiteTypeId, orderNumber from BurialSiteTypeFields where burialSiteTypeFieldId = ?')
        .get(burialSiteTypeFieldId);
}
