import { acquireConnection } from './pool.js';
/**
 * Updates a cemetery in the database.
 * Be sure to rebuild burial site names after updating a cemetery.
 * @param updateForm - The form data from the update cemetery form.
 * @param user - The user who is updating the cemetery.
 * @returns `true` if the cemetery was updated successfully, `false` otherwise.
 */
export default async function updateCemetery(updateForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update Cemeteries
        set cemeteryName = ?,
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
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`)
        .run(updateForm.cemeteryName, updateForm.cemeteryKey, updateForm.cemeteryDescription, updateForm.cemeterySvg, updateForm.cemeteryLatitude === ''
        ? undefined
        : updateForm.cemeteryLatitude, updateForm.cemeteryLongitude === ''
        ? undefined
        : updateForm.cemeteryLongitude, updateForm.cemeteryAddress1, updateForm.cemeteryAddress2, updateForm.cemeteryCity, updateForm.cemeteryProvince, updateForm.cemeteryPostalCode, updateForm.cemeteryPhoneNumber, updateForm.parentCemeteryId === ''
        ? undefined
        : updateForm.parentCemeteryId, user.userName, Date.now(), updateForm.cemeteryId);
    database.release();
    return result.changes > 0;
}
