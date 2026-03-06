import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function reopenWorkOrder(workOrderId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(/* sql */ `
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
        .prepare(/* sql */ `
      UPDATE WorkOrders
      SET
        workOrderCloseDate = NULL,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderId = ?
        AND workOrderCloseDate IS NOT NULL
    `)
        .run(user.userName, Date.now(), workOrderId);
    if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
        const recordAfter = database
            .prepare(/* sql */ `
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
