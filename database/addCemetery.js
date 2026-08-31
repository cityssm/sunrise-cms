import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getCemetery from './getCemetery.js';
import updateCemeteryDirectionsOfArrival from './updateCemeteryDirectionsOfArrival.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addCemetery(form, user, connectedDatabase) {
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
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(form.cemeteryName, form.cemeteryKey, form.cemeteryDescription, form.cemeterySvg, form.cemeteryLatitude === '' ? undefined : form.cemeteryLatitude, form.cemeteryLongitude === '' ? undefined : form.cemeteryLongitude, form.cemeteryAddress1, form.cemeteryAddress2, form.cemeteryCity, form.cemeteryProvince, form.cemeteryPostalCode.toUpperCase(), form.cemeteryPhoneNumber, form.parentCemeteryId === '' ? undefined : form.parentCemeteryId, form.findagraveCemeteryId === '' ? undefined : form.findagraveCemeteryId, user.username, rightNowMillis, user.username, rightNowMillis);
    const cemeteryId = result.lastInsertRowid;
    updateCemeteryDirectionsOfArrival(cemeteryId, form, database);
    if (isAuditLoggingEnabled) {
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
