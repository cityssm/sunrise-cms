import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { startSyncDataToPortalTask } from '../integrations/portal/taskStart.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateIntermentContainerType(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordBefore = isAuditLoggingEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            IntermentContainerTypes
          WHERE
            intermentContainerTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(updateForm.intermentContainerTypeId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE IntermentContainerTypes
      SET
        intermentContainerType = ?,
        isCremationType = ?,
        isAvailableOnPortal = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND intermentContainerTypeId = ?
    `)
        .run(updateForm.intermentContainerType, updateForm.isCremationType, updateForm.isAvailableOnPortal ?? '0', user.username, rightNowMillis, updateForm.intermentContainerTypeId);
    if (isAuditLoggingEnabled && result.changes > 0) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          IntermentContainerTypes
        WHERE
          intermentContainerTypeId = ?
      `)
            .get(updateForm.intermentContainerTypeId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: updateForm.intermentContainerTypeId,
                mainRecordType: 'intermentContainerType',
                updateTable: 'IntermentContainerTypes'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('IntermentContainerTypes');
    startSyncDataToPortalTask();
    return result.changes > 0;
}
