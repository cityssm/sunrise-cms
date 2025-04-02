import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import getBurialSites from './getBurialSites.js';
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
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`)
        .run(updateForm.cemeteryName, updateForm.cemeteryKey, updateForm.cemeteryDescription, updateForm.cemeterySvg, updateForm.cemeteryLatitude === ''
        ? undefined
        : updateForm.cemeteryLatitude, updateForm.cemeteryLongitude === ''
        ? undefined
        : updateForm.cemeteryLongitude, updateForm.cemeteryAddress1, updateForm.cemeteryAddress2, updateForm.cemeteryCity, updateForm.cemeteryProvince, updateForm.cemeteryPostalCode, updateForm.cemeteryPhoneNumber, user.userName, Date.now(), updateForm.cemeteryId);
    /*
     * Check if burial site names need to be updated
     */
    let doRebuildBurialSiteNames = false;
    if (getConfigProperty('settings.burialSites.burialSiteNameSegments.includeCemeteryKey')) {
        const burialSites = await getBurialSites({ cemeteryId: updateForm.cemeteryId }, { limit: 1, offset: 0 }, database);
        if (burialSites.count > 0 &&
            buildBurialSiteName(updateForm.cemeteryKey, {
                burialSiteNameSegment1: burialSites.burialSites[0].burialSiteNameSegment1,
                burialSiteNameSegment2: burialSites.burialSites[0].burialSiteNameSegment2,
                burialSiteNameSegment3: burialSites.burialSites[0].burialSiteNameSegment3,
                burialSiteNameSegment4: burialSites.burialSites[0].burialSiteNameSegment4,
                burialSiteNameSegment5: burialSites.burialSites[0].burialSiteNameSegment5
            }) !== burialSites.burialSites[0].burialSiteName) {
            doRebuildBurialSiteNames = true;
        }
    }
    database.release();
    return {
        doRebuildBurialSiteNames,
        success: result.changes > 0
    };
}
