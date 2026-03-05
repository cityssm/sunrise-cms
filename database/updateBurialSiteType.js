import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateBurialSiteType(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(/* sql */ `
          SELECT
            *
          FROM
            BurialSiteTypes
          WHERE
            burialSiteTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(updateForm.burialSiteTypeId)
        : undefined;
    const result = database
        .prepare(/* sql */ `
      UPDATE BurialSiteTypes
      SET
        burialSiteType = ?,
        bodyCapacityMax = ?,
        crematedCapacityMax = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId = ?
    `)
        .run(updateForm.burialSiteType, updateForm.bodyCapacityMax === ''
        ? undefined
        : updateForm.bodyCapacityMax, updateForm.crematedCapacityMax === ''
        ? undefined
        : updateForm.crematedCapacityMax, user.userName, rightNowMillis, updateForm.burialSiteTypeId);
    if (result.changes > 0 && auditLogIsEnabled) {
        const recordAfter = database
            .prepare(/* sql */ `
        SELECT
          *
        FROM
          BurialSiteTypes
        WHERE
          burialSiteTypeId = ?
      `)
            .get(updateForm.burialSiteTypeId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordType: 'burialSiteType',
                mainRecordId: updateForm.burialSiteTypeId,
                updateTable: 'BurialSiteTypes'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('BurialSiteTypes');
    return result.changes > 0;
}
