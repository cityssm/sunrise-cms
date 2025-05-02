import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { cacheTableNames, clearCacheByTableName } from '../helpers/functions.cache.js';
const recordIdColumns = new Map([
    ['BurialSiteComments', 'burialSiteCommentId'],
    ['BurialSiteStatuses', 'burialSiteStatusId'],
    ['BurialSiteTypeFields', 'burialSiteTypeFieldId'],
    ['BurialSiteTypes', 'burialSiteTypeId'],
    ['CommittalTypes', 'committalTypeId'],
    ['ContractComments', 'contractCommentId'],
    ['Contracts', 'contractId'],
    ['ContractTypeFields', 'contractTypeFieldId'],
    ['ContractTypes', 'contractTypeId'],
    ['FeeCategories', 'feeCategoryId'],
    ['Fees', 'feeId'],
    ['IntermentContainerTypes', 'intermentContainerTypeId'],
    ['WorkOrderComments', 'workOrderCommentId'],
    ['WorkOrderMilestones', 'workOrderMilestoneId'],
    ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
    ['WorkOrders', 'workOrderId'],
    ['WorkOrderTypes', 'workOrderTypeId']
]);
const relatedTables = new Map([
    ['BurialSiteTypes', ['BurialSiteTypeFields']],
    ['Contracts', ['ContractFields', 'ContractComments']],
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
export function deleteRecord(recordTable, recordId, user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update ${recordTable}
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where ${recordIdColumns.get(recordTable)} = ?
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, recordId);
    for (const relatedTable of relatedTables.get(recordTable) ?? []) {
        database
            .prepare(`update ${relatedTable}
          set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
          where ${recordIdColumns.get(recordTable)} = ?
          and recordDelete_timeMillis is null`)
            .run(user.userName, rightNowMillis, recordId);
    }
    database.close();
    // Clear cache for tables that are cached
    if (cacheTableNames.includes(recordTable)) {
        clearCacheByTableName(recordTable);
    }
    return result.changes > 0;
}
