import getObjectDifference from '@cityssm/object-difference';
import { isAuditLoggingEnabled } from '../helpers/config.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
export function restoreFuneralHome(funeralHomeId, user, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const rightNowMillis = Date.now();
    const recordBefore = isAuditLoggingEnabled
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
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        funeralHomeId = ?
        AND recordDelete_timeMillis IS NOT NULL
    `)
        .run(user.username, rightNowMillis, funeralHomeId);
    if (isAuditLoggingEnabled &&
        recordBefore !== undefined &&
        result.changes > 0) {
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
