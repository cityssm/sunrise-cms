import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger, dateToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export function updateWorkOrderMilestoneTime(milestoneForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(
        /* sql */ `SELECT * FROM WorkOrderMilestones WHERE workOrderMilestoneId = ?`)
            .get(milestoneForm.workOrderMilestoneId)
        : undefined;
    const result = database
        .prepare(/* sql */ `
      UPDATE WorkOrderMilestones
      SET
        workOrderMilestoneDate = ?,
        workOrderMilestoneTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
    `)
        .run(milestoneForm.workOrderMilestoneDateString === ''
        ? dateToInteger(new Date())
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString), (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? undefined
        : timeStringToInteger(milestoneForm.workOrderMilestoneTimeString), user.userName, Date.now(), milestoneForm.workOrderMilestoneId);
    if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
        const parentId = recordBefore.workOrderId;
        const recordAfter = database
            .prepare(
        /* sql */ `SELECT * FROM WorkOrderMilestones WHERE workOrderMilestoneId = ?`)
            .get(milestoneForm.workOrderMilestoneId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordType: 'workOrder',
                mainRecordId: String(parentId),
                updateTable: 'WorkOrderMilestones',
                recordIndex: String(milestoneForm.workOrderMilestoneId)
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
