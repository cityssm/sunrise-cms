import { getConfigProperty } from '../helpers/config.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function deleteContractInterment(contractId, intermentNumber, user, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const recordBefore = isAuditLoggingEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            ContractInterments
          WHERE
            contractId = ?
            AND intermentNumber = ?
        `)
            .get(contractId, intermentNumber)
        : undefined;
    const result = database
        .prepare(`
      UPDATE ContractInterments
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND intermentNumber = ?
    `)
        .run(user.username, Date.now(), contractId, intermentNumber);
    if (isAuditLoggingEnabled && result.changes > 0) {
        createAuditLogEntries({
            mainRecordId: contractId,
            mainRecordType: 'contract',
            recordIndex: intermentNumber,
            updateTable: 'ContractInterments'
        }, [
            {
                property: '*',
                type: 'deleted',
                from: recordBefore,
                to: undefined
            }
        ], user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
