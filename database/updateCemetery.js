import { acquireConnection } from './pool.js';
export default async function updateCemetery(updateForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update Maps
        set cemeteryName = ?,
        mapDescription = ?,
        mapSVG = ?,
        mapLatitude = ?,
        mapLongitude = ?,
        mapAddress1 = ?,
        mapAddress2 = ?,
        mapCity = ?,
        mapProvince = ?,
        mapPostalCode = ?,
        mapPhoneNumber = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`)
        .run(updateForm.cemeteryName, updateForm.cemeteryDescription, updateForm.cemeterySvg, updateForm.cemeteryLatitude === '' ? undefined : updateForm.cemeteryLatitude, updateForm.cemeteryLongitude === '' ? undefined : updateForm.cemeteryLongitude, updateForm.cemeteryAddress1, updateForm.cemeteryAddress2, updateForm.cemeteryCity, updateForm.cemeteryProvince, updateForm.cemeteryPostalCode, updateForm.cemeteryPhoneNumber, user.userName, Date.now(), updateForm.cemeteryId);
    database.release();
    return result.changes > 0;
}
