import sqlite from 'better-sqlite3';
import { cacheTableNames, clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
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
export function deleteRecord(recordTable, recordId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
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
    if (connectedDatabase === undefined) {
        database.close();
    }
    // Clear cache for tables that are cached
    if (cacheTableNames.includes(recordTable)) {
        clearCacheByTableName(recordTable);
    }
    return result.changes > 0;
}
