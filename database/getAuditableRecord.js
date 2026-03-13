import { getConfigProperty } from '../helpers/config.helpers.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
const recordId = {
    ContractFields: 'contractId',
    Contracts: 'contractId'
};
function getAuditableRecord(tableName, recordIdValue, connectedDatabase) {
    return auditLogIsEnabled
        ? connectedDatabase
            .prepare(/* sql */ `
          SELECT
            *
          FROM
            ${tableName}
          WHERE
            ${recordId[tableName]} = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(recordIdValue)
        : undefined;
}
export function getAuditableContractRecord(contractId, connectedDatabase) {
    return getAuditableRecord('Contracts', contractId, connectedDatabase);
}
export function getAuditableContractFieldRecords(contractId, connectedDatabase) {
    return getAuditableRecord('ContractFields', contractId, connectedDatabase);
}
