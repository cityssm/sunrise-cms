import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { startSyncDataToPortalTask } from '../integrations/portal/taskStart.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addBurialSiteType(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        BurialSiteTypes (
          burialSiteType,
          bodyCapacityMax,
          crematedCapacityMax,
          isAvailableOnPortal,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(form.burialSiteType, form.bodyCapacityMax === '' ? undefined : form.bodyCapacityMax, form.crematedCapacityMax === '' ? undefined : form.crematedCapacityMax, form.isAvailableOnPortal ?? '0', form.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    if (isAuditLoggingEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          BurialSiteTypes
        WHERE
          burialSiteTypeId = ?
      `)
            .get(result.lastInsertRowid);
        createAuditLogEntries({
            mainRecordId: String(result.lastInsertRowid),
            mainRecordType: 'burialSiteType',
            updateTable: 'BurialSiteTypes'
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
    clearCacheByTableName('BurialSiteTypes');
    if (form.isAvailableOnPortal === '1') {
        startSyncDataToPortalTask();
    }
    return result.lastInsertRowid;
}
