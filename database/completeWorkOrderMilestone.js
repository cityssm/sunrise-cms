import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function completeWorkOrderMilestone(milestoneForm, user, connectedDatabase) {
    const rightNow = new Date();
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const completionDate = (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
        ? dateToInteger(rightNow)
        : dateStringToInteger(milestoneForm.workOrderMilestoneCompletionDateString);
    const completionTime = (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
        ? dateToTimeInteger(rightNow)
        : timeStringToInteger(milestoneForm.workOrderMilestoneCompletionTimeString);
    const recordBefore = auditLogIsEnabled
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
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
    `)
        .run(completionDate, completionTime, user.userName, rightNow.getTime(), milestoneForm.workOrderMilestoneId);
    if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
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
