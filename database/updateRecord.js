import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const recordNameIdColumns = new Map([
    ['BurialSiteStatuses', ['burialSiteStatus', 'burialSiteStatusId']],
    ['CommittalTypes', ['committalType', 'committalTypeId']],
    [
        'WorkOrderMilestoneTypes',
        ['workOrderMilestoneType', 'workOrderMilestoneTypeId']
    ],
    ['WorkOrderTypes', ['workOrderType', 'workOrderTypeId']]
]);
function updateRecord(record, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const columnNames = recordNameIdColumns.get(record.recordTable);
    if (columnNames === undefined) {
        throw new Error(`Invalid record table: ${record.recordTable}`);
    }
    const result = database
        .prepare(`update ${record.recordTable}
        set ${columnNames[0]} = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and ${columnNames[1]} = ?`)
        .run(record.recordName, user.userName, Date.now(), record.recordId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName(record.recordTable);
    return result.changes > 0;
}
export function updateBurialSiteStatus(burialSiteStatusId, burialSiteStatus, user, connectedDatabase) {
    return updateRecord({
        recordTable: 'BurialSiteStatuses',
        recordId: burialSiteStatusId,
        recordName: burialSiteStatus
    }, user, connectedDatabase);
}
export function updateCommittalType(committalTypeId, committalType, user, connectedDatabase) {
    return updateRecord({
        recordTable: 'CommittalTypes',
        recordId: committalTypeId,
        recordName: committalType
    }, user, connectedDatabase);
}
export function updateWorkOrderMilestoneType(workOrderMilestoneTypeId, workOrderMilestoneType, user, connectedDatabase) {
    return updateRecord({
        recordTable: 'WorkOrderMilestoneTypes',
        recordId: workOrderMilestoneTypeId,
        recordName: workOrderMilestoneType
    }, user, connectedDatabase);
}
export function updateWorkOrderType(workOrderTypeId, workOrderType, user, connectedDatabase) {
    return updateRecord({
        recordTable: 'WorkOrderTypes',
        recordId: workOrderTypeId,
        recordName: workOrderType
    }, user, connectedDatabase);
}
