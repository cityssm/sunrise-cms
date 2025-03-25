import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
const recordIdColumns = new Map([
    ['BurialSiteComments', 'burialSiteCommentId'],
    ['BurialSiteStatuses', 'burialSiteStatusId'],
    ['BurialSiteTypeFields', 'burialSiteTypeFieldId'],
    ['BurialSiteTypes', 'burialSiteTypeId'],
    ['ContractComments', 'contractCommentId'],
    ['Contracts', 'contractId'],
    ['ContractTypeFields', 'contractTypeFieldId'],
    ['ContractTypes', 'contractTypeId'],
    ['FeeCategories', 'feeCategoryId'],
    ['Fees', 'feeId'],
    ['FuneralHomes', 'funeralHomeId'],
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
            'WorkOrderLots',
            'WorkOrderContracts',
            'WorkOrderComments'
        ]
    ]
]);
export async function deleteRecord(recordTable, recordId, user) {
    const database = await acquireConnection();
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
    database.release();
    clearCacheByTableName(recordTable);
    return result.changes > 0;
}
