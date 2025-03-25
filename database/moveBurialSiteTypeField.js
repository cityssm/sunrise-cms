import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export async function moveBurialSiteTypeFieldDown(burialSiteTypeFieldId) {
    const database = await acquireConnection();
    const currentField = getCurrentField(burialSiteTypeFieldId, database);
    database
        .prepare(`update BurialSiteTypeFields
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        and burialSiteTypeId = ? and orderNumber = ? + 1`)
        .run(currentField.burialSiteTypeId, currentField.orderNumber);
    const success = updateRecordOrderNumber('BurialSiteTypeFields', burialSiteTypeFieldId, currentField.orderNumber + 1, database);
    database.release();
    clearCacheByTableName('BurialSiteTypeFields');
    return success;
}
export async function moveBurialSiteTypeFieldDownToBottom(burialSiteTypeFieldId) {
    const database = await acquireConnection();
    const currentField = getCurrentField(burialSiteTypeFieldId, database);
    const maxOrderNumber = database
        .prepare(`select max(orderNumber) as maxOrderNumber
          from BurialSiteTypeFields
          where recordDelete_timeMillis is null
          and burialSiteTypeId = ?`)
        .get(currentField.burialSiteTypeId).maxOrderNumber;
    if (currentField.orderNumber !== maxOrderNumber) {
        updateRecordOrderNumber('BurialSiteTypeFields', burialSiteTypeFieldId, maxOrderNumber + 1, database);
        database
            .prepare(`update BurialSiteTypeFields
          set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          and burialSiteTypeId = ?
          and orderNumber > ?`)
            .run(currentField.burialSiteTypeId, currentField.orderNumber);
    }
    database.release();
    clearCacheByTableName('BurialSiteTypeFields');
    return true;
}
export async function moveBurialSiteTypeFieldUp(burialSiteTypeFieldId) {
    const database = await acquireConnection();
    const currentField = getCurrentField(burialSiteTypeFieldId, database);
    if (currentField.orderNumber <= 0) {
        database.release();
        return true;
    }
    database
        .prepare(`update BurialSiteTypeFields
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        and burialSiteTypeId = ?
        and orderNumber = ? - 1`)
        .run(currentField.burialSiteTypeId, currentField.orderNumber);
    const success = updateRecordOrderNumber('BurialSiteTypeFields', burialSiteTypeFieldId, currentField.orderNumber - 1, database);
    database.release();
    clearCacheByTableName('BurialSiteTypeFields');
    return success;
}
export async function moveBurialSiteTypeFieldUpToTop(burialSiteTypeFieldId) {
    const database = await acquireConnection();
    const currentField = getCurrentField(burialSiteTypeFieldId, database);
    if (currentField.orderNumber > 0) {
        updateRecordOrderNumber('BurialSiteTypeFields', burialSiteTypeFieldId, -1, database);
        database
            .prepare(`update BurialSiteTypeFields
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          and burialSiteTypeId = ?
          and orderNumber < ?`)
            .run(currentField.burialSiteTypeId, currentField.orderNumber);
    }
    database.release();
    clearCacheByTableName('BurialSiteTypeFields');
    return true;
}
function getCurrentField(burialSiteTypeFieldId, connectedDatabase) {
    return connectedDatabase
        .prepare('select burialSiteTypeId, orderNumber from BurialSiteTypeFields where burialSiteTypeFieldId = ?')
        .get(burialSiteTypeFieldId);
}
