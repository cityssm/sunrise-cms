import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function deleteWorkOrderContract(workOrderId, contractId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            WorkOrderContracts
          WHERE
            workOrderId = ?
            AND contractId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(workOrderId, contractId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE WorkOrderContracts
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        workOrderId = ?
        AND contractId = ?
    `)
        .run(user.userName, Date.now(), workOrderId, contractId);
    if (result.changes > 0 && auditLogIsEnabled) {
        createAuditLogEntries({
            mainRecordId: workOrderId,
            mainRecordType: 'workOrder',
            recordIndex: contractId,
            updateTable: 'WorkOrderContracts'
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
