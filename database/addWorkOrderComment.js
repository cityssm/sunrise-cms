import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addWorkOrderComment(workOrderCommentForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNow = new Date();
    const result = database
        .prepare(`
      INSERT INTO
        WorkOrderComments (
          workOrderId,
          commentDate,
          commentTime,
          comment,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(workOrderCommentForm.workOrderId, dateToInteger(rightNow), dateToTimeInteger(rightNow), workOrderCommentForm.comment, user.username, rightNow.getTime(), user.username, rightNow.getTime());
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          WorkOrderComments
        WHERE
          workOrderCommentId = ?
      `)
            .get(result.lastInsertRowid);
        createAuditLogEntries({
            mainRecordId: workOrderCommentForm.workOrderId,
            mainRecordType: 'workOrder',
            recordIndex: String(result.lastInsertRowid),
            updateTable: 'WorkOrderComments'
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
    return result.lastInsertRowid;
}
