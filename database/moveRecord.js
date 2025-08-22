import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
const recordIdColumns = new Map([
    ['BurialSiteStatuses', 'burialSiteStatusId'],
    ['BurialSiteTypes', 'burialSiteTypeId'],
    ['CommittalTypes', 'committalTypeId'],
    ['ContractTypes', 'contractTypeId'],
    ['FeeCategories', 'feeCategoryId'],
    ['IntermentContainerTypes', 'intermentContainerTypeId'],
    ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
    ['WorkOrderTypes', 'workOrderTypeId']
]);
export function moveRecordDown(recordTable, recordId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, database);
    database
        .prepare(`update ${recordTable}
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        and orderNumber = ? + 1`)
        .run(currentOrderNumber);
    const success = updateRecordOrderNumber(recordTable, recordId, currentOrderNumber + 1, database);
    if (connectedDatabase === undefined) {

      database.close()

    }
    clearCacheByTableName(recordTable);
    return success;
}
export function moveRecordDownToBottom(recordTable, recordId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, database);
    const maxOrderNumber = database
        .prepare(`select max(orderNumber) as maxOrderNumber
          from ${recordTable}
          where recordDelete_timeMillis is null`)
        .get().maxOrderNumber;
    if (currentOrderNumber !== maxOrderNumber) {
        updateRecordOrderNumber(recordTable, recordId, maxOrderNumber + 1, database);
        database
            .prepare(`update ${recordTable}
          set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          and orderNumber > ?`)
            .run(currentOrderNumber);
    }
    if (connectedDatabase === undefined) {

      database.close()

    }
    clearCacheByTableName(recordTable);
    return true;
}
export function moveRecordUp(recordTable, recordId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, database);
    if (currentOrderNumber <= 0) {
        if (connectedDatabase === undefined) {

          database.close()

        }
        return true;
    }
    database
        .prepare(`update ${recordTable}
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        and orderNumber = ? - 1`)
        .run(currentOrderNumber);
    const success = updateRecordOrderNumber(recordTable, recordId, currentOrderNumber - 1, database);
    if (connectedDatabase === undefined) {

      database.close()

    }
    clearCacheByTableName(recordTable);
    return success;
}
export function moveRecordUpToTop(recordTable, recordId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, database);
    if (currentOrderNumber > 0) {
        updateRecordOrderNumber(recordTable, recordId, -1, database);
        database
            .prepare(`update ${recordTable}
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          and orderNumber < ?`)
            .run(currentOrderNumber);
    }
    if (connectedDatabase === undefined) {

      database.close()

    }
    clearCacheByTableName(recordTable);
    return true;
}
function getCurrentOrderNumber(recordTable, recordId, database) {
    const currentOrderNumber = database
        .prepare(`select orderNumber
          from ${recordTable}
          where ${recordIdColumns.get(recordTable)} = ?`)
        .get(recordId).orderNumber;
    return currentOrderNumber;
}
