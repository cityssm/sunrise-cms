import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function deleteWorkOrderBurialSite(workOrderId, burialSiteId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            WorkOrderBurialSites
          WHERE
            workOrderId = ?
            AND burialSiteId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(workOrderId, burialSiteId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE WorkOrderBurialSites
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        workOrderId = ?
        AND burialSiteId = ?
    `)
        .run(user.userName, Date.now(), workOrderId, burialSiteId);
    if (result.changes > 0 && auditLogIsEnabled) {
        createAuditLogEntries({
            mainRecordId: workOrderId,
            mainRecordType: 'workOrder',
            recordIndex: burialSiteId,
            updateTable: 'WorkOrderBurialSites'
        }, [
            {
                property: '*',
                type: 'deleted',
                from: recordBefore,
                to: undefined
            }
        ], user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
