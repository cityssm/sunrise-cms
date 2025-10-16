import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const recordNameColumns = new Map([
    ['BurialSiteStatuses', 'burialSiteStatus'],
    ['WorkOrderMilestoneTypes', 'workOrderMilestoneType'],
    ['WorkOrderTypes', 'workOrderType']
]);
function addRecord(record, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into ${record.recordTable} (
        ${recordNameColumns.get(record.recordTable)},
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`)
        .run(record.recordName, record.orderNumber === '' ? -1 : record.orderNumber, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName(record.recordTable);
    return result.lastInsertRowid;
}
export function addBurialSiteStatus(burialSiteStatus, orderNumber, user, connectedDatabase) {
    return addRecord({
        recordTable: 'BurialSiteStatuses',
        recordName: burialSiteStatus,
        orderNumber
    }, user, connectedDatabase);
}
export function addWorkOrderMilestoneType(workOrderMilestoneType, orderNumber, user, connectedDatabase) {
    return addRecord({
        recordTable: 'WorkOrderMilestoneTypes',
        recordName: workOrderMilestoneType,
        orderNumber
    }, user, connectedDatabase);
}
export function addWorkOrderType(workOrderType, orderNumber, user, connectedDatabase) {
    return addRecord({
        recordTable: 'WorkOrderTypes',
        recordName: workOrderType,
        orderNumber
    }, user, connectedDatabase);
}
