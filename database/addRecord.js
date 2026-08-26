import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import { getAuditableRecords } from './getAuditableRecords.js';
const recordNameColumns = new Map([
    ['BurialSiteStatuses', 'burialSiteStatus'],
    ['WorkOrderMilestoneTypes', 'workOrderMilestoneType'],
    ['WorkOrderStatuses', 'workOrderStatus'],
    ['WorkOrderTypes', 'workOrderType']
]);
const recordAuditInfo = new Map([
    [
        'BurialSiteStatuses',
        { mainRecordType: 'burialSiteStatus', recordIdColumn: 'burialSiteStatusId' }
    ],
    [
        'WorkOrderMilestoneTypes',
        {
            mainRecordType: 'workOrderMilestoneType',
            recordIdColumn: 'workOrderMilestoneTypeId'
        }
    ],
    [
        'WorkOrderStatuses',
        { mainRecordType: 'workOrderStatus', recordIdColumn: 'workOrderStatusId' }
    ],
    [
        'WorkOrderTypes',
        { mainRecordType: 'workOrderType', recordIdColumn: 'workOrderTypeId' }
    ]
]);
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
function addRecord(record, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        ${record.recordTable} (
          ${recordNameColumns.get(record.recordTable)},
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?)
    `)
        .run(record.recordName, record.orderNumber === '' ? -1 : record.orderNumber, user.username, rightNowMillis, user.username, rightNowMillis);
    const recordId = result.lastInsertRowid;
    if (auditLogIsEnabled) {
        const auditInfo = recordAuditInfo.get(record.recordTable);
        if (auditInfo !== undefined) {
            const recordAfter = getAuditableRecords(record.recordTable, recordId, database);
            createAuditLogEntries({
                mainRecordId: recordId,
                mainRecordType: auditInfo.mainRecordType,
                updateTable: record.recordTable
            }, [
                {
                    property: '*',
                    type: 'created',
                    from: undefined,
                    to: recordAfter
                }
            ], user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName(record.recordTable);
    return recordId;
}
export function addBurialSiteStatus(burialSiteStatus, orderNumber, user, connectedDatabase) {
    return addRecord({
        recordName: burialSiteStatus,
        recordTable: 'BurialSiteStatuses',
        orderNumber
    }, user, connectedDatabase);
}
export function addWorkOrderMilestoneType(workOrderMilestoneType, orderNumber, user, connectedDatabase) {
    return addRecord({
        recordName: workOrderMilestoneType,
        recordTable: 'WorkOrderMilestoneTypes',
        orderNumber
    }, user, connectedDatabase);
}
export function addWorkOrderType(workOrderType, orderNumber, user, connectedDatabase) {
    return addRecord({
        recordName: workOrderType,
        recordTable: 'WorkOrderTypes',
        orderNumber
    }, user, connectedDatabase);
}
export function addWorkOrderStatus(workOrderStatus, orderNumber, user, connectedDatabase) {
    return addRecord({
        recordName: workOrderStatus,
        recordTable: 'WorkOrderStatuses',
        orderNumber
    }, user, connectedDatabase);
}
