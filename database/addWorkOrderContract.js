import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addWorkOrderContract(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordDeleteTimeMillis = database
        .prepare(/* sql */ `
      SELECT
        recordDelete_timeMillis
      FROM
        WorkOrderContracts
      WHERE
        workOrderId = ?
        AND contractId = ?
    `)
        .pluck()
        .get(addForm.workOrderId, addForm.contractId);
    if (recordDeleteTimeMillis === undefined) {
        database
            .prepare(/* sql */ `
        INSERT INTO
          WorkOrderContracts (
            workOrderId,
            contractId,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?)
      `)
            .run(addForm.workOrderId, addForm.contractId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    else if (recordDeleteTimeMillis !== null) {
        database
            .prepare(/* sql */ `
        UPDATE WorkOrderContracts
        SET
          recordCreate_userName = ?,
          recordCreate_timeMillis = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_userName = NULL,
          recordDelete_timeMillis = NULL
        WHERE
          workOrderId = ?
          AND contractId = ?
      `)
            .run(user.userName, rightNowMillis, user.userName, rightNowMillis, addForm.workOrderId, addForm.contractId);
    }
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(/* sql */ `
        SELECT
          *
        FROM
          WorkOrderContracts
        WHERE
          workOrderId = ?
          AND contractId = ?
      `)
            .get(addForm.workOrderId, addForm.contractId);
        createAuditLogEntries({
            mainRecordId: addForm.workOrderId,
            mainRecordType: 'workOrder',
            recordIndex: addForm.contractId,
            updateTable: 'WorkOrderContracts'
        }, [
            {
                property: '*',
                type: 'created',
                from: undefined,
                to: recordAfter
            }
        ], user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}
