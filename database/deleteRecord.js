import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
const recordIdColumns = new Map();
recordIdColumns.set('FeeCategories', 'feeCategoryId');
recordIdColumns.set('Fees', 'feeId');
recordIdColumns.set('BurialSites', 'burialSiteId');
recordIdColumns.set('BurialSiteComments', 'burialSiteCommentId');
recordIdColumns.set('BurialSiteContracts', 'burialSiteContractId');
recordIdColumns.set('BurialSiteContractComments', 'burialSiteContractCommentId');
recordIdColumns.set('BurialSiteStatuses', 'burialSiteStatusId');
recordIdColumns.set('BurialSiteTypes', 'burialSiteTypeId');
recordIdColumns.set('BurialSiteTypeFields', 'burialSiteFieldTypeId');
recordIdColumns.set('Cemeteries', 'cemeteryId');
recordIdColumns.set('ContractTypes', 'contractTypeId');
recordIdColumns.set('ContractTypeFields', 'contractTypeFieldId');
recordIdColumns.set('WorkOrders', 'workOrderId');
recordIdColumns.set('WorkOrderComments', 'workOrderCommentId');
recordIdColumns.set('WorkOrderMilestones', 'workOrderMilestoneId');
recordIdColumns.set('WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId');
recordIdColumns.set('WorkOrderTypes', 'workOrderTypeId');
const relatedTables = new Map();
relatedTables.set('FeeCategories', ['Fees']);
relatedTables.set('BurialSites', ['BurialSiteFields', 'BurialSiteComments']);
relatedTables.set('BurialSiteContracts', [
    'BurialSiteContractFields',
    'BurialSiteContractComments'
]);
relatedTables.set('BurialSiteTypes', ['BurialSiteTypeFields']);
relatedTables.set('Cemeteries', ['BurialSites']);
relatedTables.set('ContractTypes', ['ContractTypePrints', 'ContractTypeFields']);
relatedTables.set('WorkOrders', [
    'WorkOrderMilestones',
    'WorkOrderLots',
    'WorkOrderLotOccupancies',
    'WorkOrderComments'
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
