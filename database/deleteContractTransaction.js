import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function deleteContractTransaction(contractId, transactionIndex, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(
        /* sql */ `SELECT * FROM ContractTransactions WHERE contractId = ? AND transactionIndex = ? AND recordDelete_timeMillis IS NULL`)
            .get(contractId, transactionIndex)
        : undefined;
    const result = database
        .prepare(/* sql */ `
      UPDATE ContractTransactions
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND transactionIndex = ?
    `)
        .run(user.userName, Date.now(), contractId, transactionIndex);
    if (result.changes > 0 && auditLogIsEnabled) {
        createAuditLogEntries({
            mainRecordType: 'contract',
            mainRecordId: String(contractId),
            updateTable: 'ContractTransactions',
            recordIndex: String(transactionIndex)
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
