import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateWorkOrder(workOrderForm, user, connectedDatabase) {
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
            AND recordDelete_timeMillis IS NULL
        `)
            .get(workOrderForm.workOrderId)
        : undefined;
    const result = database
        .prepare(/* sql */ `
      UPDATE WorkOrders
      SET
        workOrderNumber = ?,
        workOrderTypeId = ?,
        workOrderDescription = ?,
        workOrderOpenDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(workOrderForm.workOrderNumber, workOrderForm.workOrderTypeId, workOrderForm.workOrderDescription, dateStringToInteger(workOrderForm.workOrderOpenDateString), user.userName, Date.now(), workOrderForm.workOrderId);
    if (result.changes > 0 && auditLogIsEnabled) {
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
                mainRecordType: 'workOrder',
                mainRecordId: workOrderForm.workOrderId,
                updateTable: 'WorkOrders'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
