import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { startSyncDataToPortalTask } from '../integrations/portal/taskStart.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addIntermentDepth(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        IntermentDepths (
          intermentDepth,
          intermentDepthKey,
          isAvailableOnPortal,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(form.intermentDepth, form.intermentDepthKey ?? '', form.isAvailableOnPortal ?? '0', form.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    const intermentDepthId = result.lastInsertRowid;
    if (isAuditLoggingEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          IntermentDepths
        WHERE
          intermentDepthId = ?
      `)
            .get(intermentDepthId);
        createAuditLogEntries({
            mainRecordId: intermentDepthId,
            mainRecordType: 'intermentDepth',
            updateTable: 'IntermentDepths'
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
    clearCacheByTableName('IntermentDepths');
    if (form.isAvailableOnPortal === '1') {
        startSyncDataToPortalTask();
    }
    return intermentDepthId;
}
