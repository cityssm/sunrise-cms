import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function reopenWorkOrderMilestone(workOrderMilestoneId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            WorkOrderMilestones
          WHERE
            workOrderMilestoneId = ?
            AND workOrderMilestoneCompletionDate IS NOT NULL
        `)
            .get(workOrderMilestoneId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE WorkOrderMilestones
      SET
        workOrderMilestoneCompletionDate = NULL,
        workOrderMilestoneCompletionTime = NULL,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
        AND workOrderMilestoneCompletionDate IS NOT NULL
    `)
        .run(user.userName, Date.now(), workOrderMilestoneId);
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
            .get(workOrderMilestoneId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: parentId,
                mainRecordType: 'workOrder',
                recordIndex: workOrderMilestoneId,
                updateTable: 'WorkOrderMilestones'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
