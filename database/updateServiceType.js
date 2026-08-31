import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateServiceType(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = isAuditLoggingEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            ServiceTypes
          WHERE
            serviceTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(updateForm.serviceTypeId)
        : undefined;
    const info = database
        .prepare(`
      UPDATE ServiceTypes
      SET
        serviceType = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(updateForm.serviceType, user.username, Date.now(), updateForm.serviceTypeId);
    const success = info.changes > 0;
    if (success) {
        if (isAuditLoggingEnabled) {
            const recordAfter = database
                .prepare(`
          SELECT
            *
          FROM
            ServiceTypes
          WHERE
            serviceTypeId = ?
        `)
                .get(updateForm.serviceTypeId);
            const differences = getObjectDifference(recordBefore, recordAfter);
            if (differences.length > 0) {
                createAuditLogEntries({
                    mainRecordId: updateForm.serviceTypeId,
                    mainRecordType: 'serviceType',
                    updateTable: 'ServiceTypes'
                }, differences, user, database);
            }
        }
        clearCacheByTableName('ServiceTypes');
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return success;
}
