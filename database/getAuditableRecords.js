import { getConfigProperty } from '../helpers/config.helpers.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
const recordId = {
    BurialSiteStatuses: 'burialSiteStatusId',
    ContractFields: 'contractId',
    Contracts: 'contractId',
    WorkOrderMilestoneTypes: 'workOrderMilestoneTypeId',
    WorkOrderTypes: 'workOrderTypeId'
};
export function getAuditableRecords(tableName, recordIdValue, connectedDatabase) {
    const idColumn = recordId[tableName];
    if (idColumn === undefined) {
        throw new Error('Invalid table name for auditable record lookup.');
    }
    return auditLogIsEnabled
        ? connectedDatabase
            .prepare(/* sql */ `
          SELECT
            *
          FROM
            ${tableName}
          WHERE
            ${idColumn} = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .all(recordIdValue)
        : undefined;
}
export function getAuditableContractRecord(contractId, connectedDatabase) {
    const records = getAuditableRecords('Contracts', contractId, connectedDatabase);
    return records === undefined || records.length === 0 ? undefined : records[0];
}
export function getAuditableContractFieldRecords(contractId, connectedDatabase) {
    const records = getAuditableRecords('ContractFields', contractId, connectedDatabase);
    return records === undefined || records.length === 0 ? undefined : records;
}
