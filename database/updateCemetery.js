import { acquireConnection } from './pool.js';
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
