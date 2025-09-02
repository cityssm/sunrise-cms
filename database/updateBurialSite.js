import sqlite from 'better-sqlite3';
import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import addOrUpdateBurialSiteFields from './addOrUpdateBurialSiteFields.js';
import getCemetery from './getCemetery.js';
/**
 * Updates a burial site.
 * @param updateForm - The burial site's updated information
 * @param user - The user making the request
 * @returns True if the burial site was updated.
 * @throws If an active burial site with the same name already exists.
 */
export default function updateBurialSite(updateForm, user) {
    const database = sqlite(sunriseDB);
    const cemetery = updateForm.cemeteryId === ''
        ? undefined
        : getCemetery(updateForm.cemeteryId, database);
    const burialSiteName = buildBurialSiteName(cemetery?.cemeteryKey, updateForm);
    // Ensure no active burial sites share the same name
    const existingBurialSite = database
        .prepare(`select burialSiteId
        from BurialSites
        where burialSiteName = ?
        and burialSiteId <> ?
        and recordDelete_timeMillis is null`)
        .pluck()
        .get(burialSiteName, updateForm.burialSiteId);
    if (existingBurialSite !== undefined) {
        database.close();
        throw new Error('An active burial site with that name already exists.');
    }
    const result = database
        .prepare(`update BurialSites
        set burialSiteNameSegment1 = ?,
          burialSiteNameSegment2 = ?,
          burialSiteNameSegment3 = ?,
          burialSiteNameSegment4 = ?,
          burialSiteNameSegment5 = ?,
          burialSiteName = ?,
          burialSiteTypeId = ?,
          burialSiteStatusId = ?,
          bodyCapacity = ?,
          crematedCapacity = ?,
          cemeteryId = ?,
          cemeterySvgId = ?,
          burialSiteImage = ?,
          burialSiteLatitude = ?,
          burialSiteLongitude = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where burialSiteId = ?
          and recordDelete_timeMillis is null`)
        .run(updateForm.burialSiteNameSegment1 ?? '', updateForm.burialSiteNameSegment2 ?? '', updateForm.burialSiteNameSegment3 ?? '', updateForm.burialSiteNameSegment4 ?? '', updateForm.burialSiteNameSegment5 ?? '', burialSiteName, updateForm.burialSiteTypeId, updateForm.burialSiteStatusId === ''
        ? undefined
        : updateForm.burialSiteStatusId, updateForm.bodyCapacity === '' ? undefined : updateForm.bodyCapacity, updateForm.crematedCapacity === ''
        ? undefined
        : updateForm.crematedCapacity, updateForm.cemeteryId === '' ? undefined : updateForm.cemeteryId, updateForm.cemeterySvgId, updateForm.burialSiteImage, updateForm.burialSiteLatitude === ''
        ? undefined
        : updateForm.burialSiteLatitude, updateForm.burialSiteLongitude === ''
        ? undefined
        : updateForm.burialSiteLongitude, user.userName, Date.now(), updateForm.burialSiteId);
    if (result.changes > 0) {
        addOrUpdateBurialSiteFields({
            burialSiteId: updateForm.burialSiteId,
            fieldForm: updateForm
        }, false, user, database);
    }
    database.close();
    return result.changes > 0;
}
export function updateBurialSiteStatus(burialSiteId, burialSiteStatusId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update BurialSites
        set burialSiteStatusId = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where burialSiteId = ?
          and recordDelete_timeMillis is null`)
        .run(burialSiteStatusId === '' ? undefined : burialSiteStatusId, user.userName, rightNowMillis, burialSiteId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
export function updateBurialSiteLatitudeLongitude(burialSiteId, burialSiteLatitude, burialSiteLongitude, user) {
    const database = sqlite(sunriseDB);
    const result = database
        .prepare(`update BurialSites
        set burialSiteLatitude = ?,
          burialSiteLongitude = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where burialSiteId = ?
          and recordDelete_timeMillis is null`)
        .run(burialSiteLatitude === '' ? undefined : burialSiteLatitude, burialSiteLongitude === '' ? undefined : burialSiteLongitude, user.userName, Date.now(), burialSiteId);
    database.close();
    return result.changes > 0;
}
