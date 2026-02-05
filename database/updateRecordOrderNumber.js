const recordIdColumns = new Map([
    ['BurialSiteStatuses', 'burialSiteStatusId'],
    ['BurialSiteTypeFields', 'burialSiteTypeFieldId'],
    ['BurialSiteTypes', 'burialSiteTypeId'],
    ['CommittalTypes', 'committalTypeId'],
    ['ContractTypeFields', 'contractTypeFieldId'],
    ['ContractTypes', 'contractTypeId'],
    ['FeeCategories', 'feeCategoryId'],
    ['Fees', 'feeId'],
    ['IntermentContainerTypes', 'intermentContainerTypeId'],
    ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
    ['WorkOrderTypes', 'workOrderTypeId']
]);
export function updateRecordOrderNumber(recordTable, recordId, orderNumber, connectedDatabase) {
    const result = connectedDatabase
        .prepare(/* sql */ `
      UPDATE ${recordTable}
      SET
        orderNumber = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND ${recordIdColumns.get(recordTable)} = ?
    `)
        .run(orderNumber, recordId);
    return result.changes > 0;
}
