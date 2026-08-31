import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function deleteContractFee(contractId, feeId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = isAuditLoggingEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            ContractFees
          WHERE
            contractId = ?
            AND feeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(contractId, feeId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE ContractFees
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND feeId = ?
    `)
        .run(user.username, Date.now(), contractId, feeId);
    if (result.changes > 0 && isAuditLoggingEnabled) {
        createAuditLogEntries({
            mainRecordId: contractId,
            mainRecordType: 'contract',
            recordIndex: feeId,
            updateTable: 'ContractFees'
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
