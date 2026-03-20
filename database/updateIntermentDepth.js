import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateIntermentDepth(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            IntermentDepths
          WHERE
            intermentDepthId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(updateForm.intermentDepthId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE IntermentDepths
      SET
        intermentDepth = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND intermentDepthId = ?
    `)
        .run(updateForm.intermentDepth, user.userName, rightNowMillis, updateForm.intermentDepthId);
    if (result.changes > 0 && auditLogIsEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          IntermentDepths
        WHERE
          intermentDepthId = ?
      `)
            .get(updateForm.intermentDepthId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: updateForm.intermentDepthId,
                mainRecordType: 'intermentDepth',
                updateTable: 'IntermentDepths'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('IntermentDepths');
    return result.changes > 0;
}
