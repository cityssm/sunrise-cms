import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addWorkOrderBurialSite(workOrderBurialSiteForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordDeleteTimeMillis = database
        .prepare(/* sql */ `
      SELECT
        recordDelete_timeMillis
      FROM
        WorkOrderBurialSites
      WHERE
        workOrderId = ?
        AND burialSiteId = ?
    `)
        .pluck()
        .get(workOrderBurialSiteForm.workOrderId, workOrderBurialSiteForm.burialSiteId);
    if (recordDeleteTimeMillis === undefined) {
        database
            .prepare(/* sql */ `
        INSERT INTO
          WorkOrderBurialSites (
            workOrderId,
            burialSiteId,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?)
      `)
            .run(workOrderBurialSiteForm.workOrderId, workOrderBurialSiteForm.burialSiteId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    else if (recordDeleteTimeMillis !== null) {
        database
            .prepare(/* sql */ `
        UPDATE WorkOrderBurialSites
        SET
          recordCreate_userName = ?,
          recordCreate_timeMillis = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_userName = NULL,
          recordDelete_timeMillis = NULL
        WHERE
          workOrderId = ?
          AND burialSiteId = ?
      `)
            .run(user.userName, rightNowMillis, user.userName, rightNowMillis, workOrderBurialSiteForm.workOrderId, workOrderBurialSiteForm.burialSiteId);
    }
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(/* sql */ `
        SELECT
          *
        FROM
          WorkOrderBurialSites
        WHERE
          workOrderId = ?
          AND burialSiteId = ?
      `)
            .get(workOrderBurialSiteForm.workOrderId, workOrderBurialSiteForm.burialSiteId);
        createAuditLogEntries({
            mainRecordType: 'workOrder',
            mainRecordId: workOrderBurialSiteForm.workOrderId,
            updateTable: 'WorkOrderBurialSites',
            recordIndex: workOrderBurialSiteForm.burialSiteId
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
    return true;
}
