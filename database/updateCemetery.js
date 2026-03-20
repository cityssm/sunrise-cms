import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getCemetery from './getCemetery.js';
import updateCemeteryDirectionsOfArrival from './updateCemeteryDirectionsOfArrival.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
/**
 * Updates a cemetery in the database.
 * Be sure to rebuild burial site names after updating a cemetery.
 * @param updateForm - The form data from the update cemetery form.
 * @param user - The user who is updating the cemetery.
 * @param connectedDatabase - An optional connected database instance.
 * @returns `true` if the cemetery was updated successfully, `false` otherwise.
 */
export default function updateCemetery(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? getCemetery(updateForm.cemeteryId, database)
        : undefined;
    const result = database
        .prepare(/* sql */ `
      UPDATE Cemeteries
      SET
        cemeteryName = ?,
        cemeteryKey = ?,
        cemeteryDescription = ?,
        cemeterySvg = ?,
        cemeteryLatitude = ?,
        cemeteryLongitude = ?,
        cemeteryAddress1 = ?,
        cemeteryAddress2 = ?,
        cemeteryCity = ?,
        cemeteryProvince = ?,
        cemeteryPostalCode = ?,
        cemeteryPhoneNumber = ?,
        parentCemeteryId = ?,
        findagraveCemeteryId = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(updateForm.cemeteryName, updateForm.cemeteryKey, updateForm.cemeteryDescription, updateForm.cemeterySvg, updateForm.cemeteryLatitude === ''
        ? undefined
        : updateForm.cemeteryLatitude, updateForm.cemeteryLongitude === ''
        ? undefined
        : updateForm.cemeteryLongitude, updateForm.cemeteryAddress1, updateForm.cemeteryAddress2, updateForm.cemeteryCity, updateForm.cemeteryProvince, updateForm.cemeteryPostalCode.toUpperCase(), updateForm.cemeteryPhoneNumber, updateForm.parentCemeteryId === ''
        ? undefined
        : updateForm.parentCemeteryId, updateForm.findagraveCemeteryId === ''
        ? undefined
        : updateForm.findagraveCemeteryId, user.userName, Date.now(), updateForm.cemeteryId);
    const recordAfter = auditLogIsEnabled
        ? getCemetery(updateForm.cemeteryId, database)
        : undefined;
    const cemeteryDifferences = getObjectDifference(recordBefore, recordAfter);
    if (cemeteryDifferences.length > 0) {
        createAuditLogEntries({
            mainRecordId: updateForm.cemeteryId,
            mainRecordType: 'cemetery',
            updateTable: 'Cemeteries'
        }, cemeteryDifferences, user, database);
    }
    const directionsBefore = recordAfter?.directionsOfArrival;
    updateCemeteryDirectionsOfArrival(updateForm.cemeteryId, updateForm, database);
    const directionsAfter = auditLogIsEnabled
        ? getCemetery(updateForm.cemeteryId, database)?.directionsOfArrival
        : undefined;
    const directionsDifferences = getObjectDifference(directionsBefore, directionsAfter);
    if (directionsDifferences.length > 0) {
        createAuditLogEntries({
            mainRecordId: updateForm.cemeteryId,
            mainRecordType: 'cemetery',
            updateTable: 'CemeteryDirectionsOfArrival'
        }, directionsDifferences, user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
