import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addWorkOrderContract(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordDeleteTimeMillis = database
        .prepare(`
      SELECT
        recordDelete_timeMillis
      FROM
        WorkOrderContracts
      WHERE
        workOrderId = ?
        AND contractId = ?
    `)
        .pluck()
        .get(form.workOrderId, form.contractId);
    if (recordDeleteTimeMillis === undefined) {
        database
            .prepare(`
        INSERT INTO
          WorkOrderContracts (
            workOrderId,
            contractId,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?)
      `)
            .run(form.workOrderId, form.contractId, user.username, rightNowMillis, user.username, rightNowMillis);
    }
    else if (recordDeleteTimeMillis !== null) {
        database
            .prepare(`
        UPDATE WorkOrderContracts
        SET
          recordCreate_username = ?,
          recordCreate_timeMillis = ?,
          recordUpdate_username = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_username = NULL,
          recordDelete_timeMillis = NULL
        WHERE
          workOrderId = ?
          AND contractId = ?
      `)
            .run(user.username, rightNowMillis, user.username, rightNowMillis, form.workOrderId, form.contractId);
    }
    if (isAuditLoggingEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          WorkOrderContracts
        WHERE
          workOrderId = ?
          AND contractId = ?
      `)
            .get(form.workOrderId, form.contractId);
        createAuditLogEntries({
            mainRecordId: form.workOrderId,
            mainRecordType: 'workOrder',
            recordIndex: form.contractId,
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
