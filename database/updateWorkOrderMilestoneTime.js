import { DatabaseSync } from 'node:sqlite';
import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger, dateToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export function updateWorkOrderMilestoneTime(milestoneForm, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
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
        workOrderMilestoneDate = ?,
        workOrderMilestoneTime = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
    `)
        .run(milestoneForm.workOrderMilestoneDateString === ''
        ? dateToInteger(new Date())
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString), (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? null
        : timeStringToInteger(milestoneForm.workOrderMilestoneTimeString), user.username, Date.now(), milestoneForm.workOrderMilestoneId);
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
