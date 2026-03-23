import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateWorkOrderComment(commentForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            WorkOrderComments
          WHERE
            workOrderCommentId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(commentForm.workOrderCommentId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE WorkOrderComments
      SET
        commentDate = ?,
        commentTime = ?,
        comment = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND workOrderCommentId = ?
    `)
        .run(dateStringToInteger(commentForm.commentDateString), timeStringToInteger(commentForm.commentTimeString), commentForm.comment, user.userName, Date.now(), commentForm.workOrderCommentId);
    if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
        const parentId = recordBefore
            .workOrderId;
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          WorkOrderComments
        WHERE
          workOrderCommentId = ?
      `)
            .get(commentForm.workOrderCommentId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: parentId,
                mainRecordType: 'workOrder',
                recordIndex: commentForm.workOrderCommentId,
                updateTable: 'WorkOrderComments'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
