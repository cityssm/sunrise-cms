import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export function restoreFuneralHome(funeralHomeId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            FuneralHomes
          WHERE
            funeralHomeId = ?
            AND recordDelete_timeMillis IS NOT NULL
        `)
            .get(funeralHomeId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE FuneralHomes
      SET
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        funeralHomeId = ?
        AND recordDelete_timeMillis IS NOT NULL
    `)
        .run(user.userName, rightNowMillis, funeralHomeId);
    if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          FuneralHomes
        WHERE
          funeralHomeId = ?
      `)
            .get(funeralHomeId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: funeralHomeId,
                mainRecordType: 'funeralHome',
                updateTable: 'FuneralHomes'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
