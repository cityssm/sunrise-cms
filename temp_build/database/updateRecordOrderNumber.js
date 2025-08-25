"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecordOrderNumber = updateRecordOrderNumber;
var recordIdColumns = new Map([
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
function updateRecordOrderNumber(recordTable, recordId, orderNumber, connectedDatabase) {
    var result = connectedDatabase
        .prepare("update ".concat(recordTable, "\n        set orderNumber = ?\n        where recordDelete_timeMillis is null\n        and ").concat(recordIdColumns.get(recordTable), " = ?"))
        .run(orderNumber, recordId);
    return result.changes > 0;
}
