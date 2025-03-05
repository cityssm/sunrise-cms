const recordIdColumns = new Map();
recordIdColumns.set('FeeCategories', 'feeCategoryId');
recordIdColumns.set('Fees', 'feeId');
recordIdColumns.set('BurialSiteStatuses', 'burialSiteStatusId');
recordIdColumns.set('BurialSiteTypes', 'burialSiteTypeId');
recordIdColumns.set('BurialSiteTypeFields', 'burialSiteTypeFieldId');
recordIdColumns.set('IntermentContainerTypes', 'intermentContainerTypeId');
recordIdColumns.set('CommittalTypes', 'committalTypeId');
recordIdColumns.set('ContractTypes', 'contractTypeId');
recordIdColumns.set('ContractTypeFields', 'contractTypeFieldId');
recordIdColumns.set('WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId');
recordIdColumns.set('WorkOrderTypes', 'workOrderTypeId');
export function updateRecordOrderNumber(recordTable, recordId, orderNumber, connectedDatabase) {
    const result = connectedDatabase
        .prepare(`update ${recordTable}
        set orderNumber = ?
        where recordDelete_timeMillis is null
        and ${recordIdColumns.get(recordTable)} = ?`)
        .run(orderNumber, recordId);
    return result.changes > 0;
}
