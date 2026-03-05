import sqlite from 'better-sqlite3';
import { cacheTableNames, clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const recordIdColumns = new Map([
    ['BurialSiteComments', 'burialSiteCommentId'],
    ['BurialSiteStatuses', 'burialSiteStatusId'],
    ['BurialSiteTypeFields', 'burialSiteTypeFieldId'],
    ['BurialSiteTypes', 'burialSiteTypeId'],
    ['CommittalTypes', 'committalTypeId'],
    ['ContractAttachments', 'contractAttachmentId'],
    ['ContractComments', 'contractCommentId'],
    ['ContractTypeFields', 'contractTypeFieldId'],
    ['ContractTypes', 'contractTypeId'],
    ['FeeCategories', 'feeCategoryId'],
    ['Fees', 'feeId'],
    ['IntermentContainerTypes', 'intermentContainerTypeId'],
    ['IntermentDepths', 'intermentDepthId'],
    ['WorkOrderComments', 'workOrderCommentId'],
    ['WorkOrderMilestones', 'workOrderMilestoneId'],
    ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
    ['WorkOrders', 'workOrderId'],
    ['WorkOrderTypes', 'workOrderTypeId']
]);
const relatedTables = new Map([
    ['BurialSiteTypes', ['BurialSiteTypeFields']],
    ['ContractTypes', ['ContractTypePrints', 'ContractTypeFields']],
    [
        'WorkOrders',
        [
            'WorkOrderMilestones',
            'WorkOrderBurialSites',
            'WorkOrderContracts',
            'WorkOrderComments'
        ]
    ]
]);
const configTableAuditInfo = new Map([
    ['BurialSiteStatuses', { mainRecordType: 'burialSiteStatus' }],
    ['BurialSiteTypes', { mainRecordType: 'burialSiteType' }],
    ['CommittalTypes', { mainRecordType: 'committalType' }],
    ['ContractTypes', { mainRecordType: 'contractType' }],
    ['Fees', { mainRecordType: 'fee' }],
    ['IntermentContainerTypes', { mainRecordType: 'intermentContainerType' }],
    ['IntermentDepths', { mainRecordType: 'intermentDepth' }],
    ['WorkOrderMilestoneTypes', { mainRecordType: 'workOrderMilestoneType' }],
    ['WorkOrderTypes', { mainRecordType: 'workOrderType' }],
    ['WorkOrders', { mainRecordType: 'workOrder' }]
]);
const childTableAuditInfo = new Map([
    [
        'BurialSiteComments',
        { mainRecordType: 'burialSite', parentIdColumn: 'burialSiteId' }
    ],
    [
        'ContractAttachments',
        { mainRecordType: 'contract', parentIdColumn: 'contractId' }
    ],
    [
        'ContractComments',
        { mainRecordType: 'contract', parentIdColumn: 'contractId' }
    ],
    [
        'WorkOrderComments',
        { mainRecordType: 'workOrder', parentIdColumn: 'workOrderId' }
    ],
    [
        'WorkOrderMilestones',
        { mainRecordType: 'workOrder', parentIdColumn: 'workOrderId' }
    ]
]);
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export function deleteRecord(recordTable, recordId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const configAuditInfo = configTableAuditInfo.get(recordTable);
    const childAuditInfo = childTableAuditInfo.get(recordTable);
    const recordBefore = auditLogIsEnabled && (configAuditInfo !== undefined || childAuditInfo !== undefined)
        ? database
            .prepare(
        /* sql */ `SELECT * FROM ${recordTable} WHERE ${recordIdColumns.get(recordTable)} = ? AND recordDelete_timeMillis IS NULL`)
            .get(recordId)
        : undefined;
    const result = database
        .prepare(/* sql */ `
      UPDATE ${recordTable}
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        ${recordIdColumns.get(recordTable)} = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, recordId);
    for (const relatedTable of relatedTables.get(recordTable) ?? []) {
        database
            .prepare(/* sql */ `
        UPDATE ${relatedTable}
        SET
          recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        WHERE
          ${recordIdColumns.get(recordTable)} = ?
          AND recordDelete_timeMillis IS NULL
      `)
            .run(user.userName, rightNowMillis, recordId);
    }
    if (result.changes > 0 && auditLogIsEnabled) {
        if (configAuditInfo !== undefined) {
            createAuditLogEntries({
                mainRecordType: configAuditInfo.mainRecordType,
                mainRecordId: String(recordId),
                updateTable: recordTable
            }, [
                {
                    property: '*',
                    type: 'deleted',
                    from: recordBefore,
                    to: undefined
                }
            ], user, database);
        }
        else if (childAuditInfo !== undefined && recordBefore !== undefined) {
            const parentId = recordBefore[childAuditInfo.parentIdColumn];
            createAuditLogEntries({
                mainRecordType: childAuditInfo.mainRecordType,
                mainRecordId: String(parentId),
                updateTable: recordTable,
                recordIndex: String(recordId)
            }, [
                {
                    property: '*',
                    type: 'deleted',
                    from: recordBefore,
                    to: undefined
                }
            ], user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    // Clear cache for tables that are cached
    if (cacheTableNames.includes(recordTable)) {
        clearCacheByTableName(recordTable);
    }
    return result.changes > 0;
}
