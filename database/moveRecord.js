import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
const recordIdColumns = new Map();
recordIdColumns.set('FeeCategories', 'feeCategoryId');
recordIdColumns.set('BurialSiteStatuses', 'burialSiteStatusId');
recordIdColumns.set('BurialSiteTypes', 'burialSiteTypeId');
recordIdColumns.set('ContractTypes', 'contractTypeId');
recordIdColumns.set('WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId');
recordIdColumns.set('WorkOrderTypes', 'workOrderTypeId');
function getCurrentOrderNumber(recordTable, recordId, database) {
    const currentOrderNumber = database
        .prepare(`select orderNumber
          from ${recordTable}
          where ${recordIdColumns.get(recordTable)} = ?`)
        .get(recordId).orderNumber;
    return currentOrderNumber;
}
export async function moveRecordDown(recordTable, recordId) {
    const database = await acquireConnection();
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, database);
    database
        .prepare(`update ${recordTable}
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        and orderNumber = ? + 1`)
        .run(currentOrderNumber);
    const success = updateRecordOrderNumber(recordTable, recordId, currentOrderNumber + 1, database);
    database.release();
    clearCacheByTableName(recordTable);
    return success;
}
export async function moveRecordDownToBottom(recordTable, recordId) {
    const database = await acquireConnection();
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
    database.release();
    clearCacheByTableName(recordTable);
    return true;
}
export async function moveRecordUp(recordTable, recordId) {
    const database = await acquireConnection();
    const currentOrderNumber = getCurrentOrderNumber(recordTable, recordId, database);
    if (currentOrderNumber <= 0) {
        database.release();
        return true;
    }
    database
        .prepare(`update ${recordTable}
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        and orderNumber = ? - 1`)
        .run(currentOrderNumber);
    const success = updateRecordOrderNumber(recordTable, recordId, currentOrderNumber - 1, database);
    database.release();
    clearCacheByTableName(recordTable);
    return success;
}
export async function moveRecordUpToTop(recordTable, recordId) {
    const database = await acquireConnection();
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
    database.release();
    clearCacheByTableName(recordTable);
    return true;
}
