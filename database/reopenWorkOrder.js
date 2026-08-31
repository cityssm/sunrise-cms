import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function reopenWorkOrder(workOrderId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = isAuditLoggingEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            WorkOrders
          WHERE
            workOrderId = ?
            AND workOrderCloseDate IS NOT NULL
        `)
            .get(workOrderId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE WorkOrders
      SET
        workOrderCloseDate = NULL,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderId = ?
        AND workOrderCloseDate IS NOT NULL
    `)
        .run(user.username, Date.now(), workOrderId);
    if (result.changes > 0 && isAuditLoggingEnabled && recordBefore !== undefined) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          WorkOrders
        WHERE
          workOrderId = ?
      `)
            .get(workOrderId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: workOrderId,
                mainRecordType: 'workOrder',
                updateTable: 'WorkOrders'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
