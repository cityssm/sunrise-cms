import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger, dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function closeWorkOrder(workOrderForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNow = new Date();
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(/* sql */ `
          SELECT
            *
          FROM
            WorkOrders
          WHERE
            workOrderId = ?
        `)
            .get(workOrderForm.workOrderId)
        : undefined;
    const result = database
        .prepare(/* sql */ `
      UPDATE WorkOrders
      SET
        workOrderCloseDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderId = ?
    `)
        .run(workOrderForm.workOrderCloseDateString
        ? dateStringToInteger(workOrderForm.workOrderCloseDateString)
        : dateToInteger(new Date()), user.userName, rightNow.getTime(), workOrderForm.workOrderId);
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
            .get(workOrderForm.workOrderId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: workOrderForm.workOrderId,
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
