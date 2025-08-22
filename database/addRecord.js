import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const recordNameColumns = new Map([
    ['BurialSiteStatuses', 'burialSiteStatus'],
    ['WorkOrderMilestoneTypes', 'workOrderMilestoneType'],
    ['WorkOrderTypes', 'workOrderType']
]);
export default function addRecord(recordTable, recordName, orderNumber, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into ${recordTable} (
        ${recordNameColumns.get(recordTable)},
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`)
        .run(recordName, orderNumber === '' ? -1 : orderNumber, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName(recordTable);
    return result.lastInsertRowid;
}
