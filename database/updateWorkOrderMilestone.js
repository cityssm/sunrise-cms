import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateWorkOrderMilestone(milestoneForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(/* sql */ `
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
        .prepare(/* sql */ `
      UPDATE WorkOrderMilestones
      SET
        workOrderMilestoneTypeId = ?,
        workOrderMilestoneDate = ?,
        workOrderMilestoneTime = ?,
        workOrderMilestoneDescription = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
    `)
        .run(milestoneForm.workOrderMilestoneTypeId === ''
        ? undefined
        : milestoneForm.workOrderMilestoneTypeId, milestoneForm.workOrderMilestoneDateString === ''
        ? 0
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString), (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? undefined
        : timeStringToInteger(milestoneForm.workOrderMilestoneTimeString), milestoneForm.workOrderMilestoneDescription, user.userName, Date.now(), milestoneForm.workOrderMilestoneId);
    if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
        const parentId = recordBefore.workOrderId;
        const recordAfter = database
            .prepare(/* sql */ `
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
                mainRecordType: 'workOrder',
                mainRecordId: String(parentId),
                updateTable: 'WorkOrderMilestones',
                recordIndex: milestoneForm.workOrderMilestoneId
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
