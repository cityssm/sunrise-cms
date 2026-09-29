import { DatabaseSync } from 'node:sqlite';
import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function completeWorkOrderMilestone(milestoneForm, user, connectedDatabase) {
    const rightNow = new Date();
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const completionDate = (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
        ? dateToInteger(rightNow)
        : dateStringToInteger(milestoneForm.workOrderMilestoneCompletionDateString);
    const completionTime = (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
        ? dateToTimeInteger(rightNow)
        : timeStringToInteger(milestoneForm.workOrderMilestoneCompletionTimeString);
    const recordBefore = isAuditLoggingEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            WorkOrderMilestones
          WHERE
            workOrderMilestoneId = ?
        `)
            .get(milestoneForm.workOrderMilestoneId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE WorkOrderMilestones
      SET
        workOrderMilestoneCompletionDate = ?,
        workOrderMilestoneCompletionTime = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
    `)
        .run(completionDate, completionTime ?? 0, user.username, rightNow.getTime(), milestoneForm.workOrderMilestoneId);
    if (isAuditLoggingEnabled &&
        recordBefore !== undefined &&
        result.changes > 0) {
        const parentId = recordBefore
            .workOrderId;
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          WorkOrderMilestones
        WHERE
          workOrderMilestoneId = ?
      `)
            .get(milestoneForm.workOrderMilestoneId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: parentId,
                mainRecordType: 'workOrder',
                recordIndex: milestoneForm.workOrderMilestoneId,
                updateTable: 'WorkOrderMilestones'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
