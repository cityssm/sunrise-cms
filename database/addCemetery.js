import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getCemetery from './getCemetery.js';
import updateCemeteryDirectionsOfArrival from './updateCemeteryDirectionsOfArrival.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addCemetery(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        Cemeteries (
          cemeteryName,
          cemeteryKey,
          cemeteryDescription,
          cemeterySvg,
          cemeteryLatitude,
          cemeteryLongitude,
          cemeteryAddress1,
          cemeteryAddress2,
          cemeteryCity,
          cemeteryProvince,
          cemeteryPostalCode,
          cemeteryPhoneNumber,
          parentCemeteryId,
          findagraveCemeteryId,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(addForm.cemeteryName, addForm.cemeteryKey, addForm.cemeteryDescription, addForm.cemeterySvg, addForm.cemeteryLatitude === '' ? undefined : addForm.cemeteryLatitude, addForm.cemeteryLongitude === '' ? undefined : addForm.cemeteryLongitude, addForm.cemeteryAddress1, addForm.cemeteryAddress2, addForm.cemeteryCity, addForm.cemeteryProvince, addForm.cemeteryPostalCode.toUpperCase(), addForm.cemeteryPhoneNumber, addForm.parentCemeteryId === '' ? undefined : addForm.parentCemeteryId, addForm.findagraveCemeteryId === '' ? undefined : addForm.findagraveCemeteryId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    const cemeteryId = result.lastInsertRowid;
    updateCemeteryDirectionsOfArrival(cemeteryId, addForm, database);
    if (auditLogIsEnabled) {
        const recordAfter = getCemetery(cemeteryId, database);
        createAuditLogEntries({
            mainRecordId: cemeteryId,
            mainRecordType: 'cemetery',
            updateTable: 'Cemeteries'
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
    clearCacheByTableName('Cemeteries');
    return cemeteryId;
}
