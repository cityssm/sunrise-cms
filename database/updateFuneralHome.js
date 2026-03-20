import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getFuneralHome from './getFuneralHome.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateFuneralHome(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordBefore = auditLogIsEnabled
        ? getFuneralHome(updateForm.funeralHomeId, false, database)
        : undefined;
    const result = database
        .prepare(`
      UPDATE FuneralHomes
      SET
        funeralHomeName = ?,
        funeralHomeAddress1 = ?,
        funeralHomeAddress2 = ?,
        funeralHomeCity = ?,
        funeralHomeProvince = ?,
        funeralHomePostalCode = ?,
        funeralHomePhoneNumber = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralHomeId = ?
    `)
        .run(updateForm.funeralHomeName, updateForm.funeralHomeAddress1, updateForm.funeralHomeAddress2, updateForm.funeralHomeCity, updateForm.funeralHomeProvince, updateForm.funeralHomePostalCode.toUpperCase(), updateForm.funeralHomePhoneNumber, user.userName, rightNowMillis, updateForm.funeralHomeId);
    if (result.changes > 0 && auditLogIsEnabled) {
        const recordAfter = getFuneralHome(updateForm.funeralHomeId, false, database);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: updateForm.funeralHomeId,
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
