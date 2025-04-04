import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import addOrUpdateBurialSiteField from './addOrUpdateBurialSiteField.js';
import deleteBurialSiteField from './deleteBurialSiteField.js';
import getCemetery from './getCemetery.js';
import { acquireConnection } from './pool.js';
/**
 * Updates a burial site.
 * @param updateForm - The burial site's updated information
 * @param user - The user making the request
 * @returns True if the burial site was updated.
 * @throws If an active burial site with the same name already exists.
 */
export default async function updateBurialSite(updateForm, user) {
    const database = await acquireConnection();
    const cemetery = updateForm.cemeteryId === ''
        ? undefined
        : await getCemetery(updateForm.cemeteryId, database);
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
        database.release();
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
        : updateForm.burialSiteStatusId, updateForm.cemeteryId === '' ? undefined : updateForm.cemeteryId, updateForm.cemeterySvgId, updateForm.burialSiteImage, updateForm.burialSiteLatitude === ''
        ? undefined
        : updateForm.burialSiteLatitude, updateForm.burialSiteLongitude === ''
        ? undefined
        : updateForm.burialSiteLongitude, user.userName, Date.now(), updateForm.burialSiteId);
    if (result.changes > 0) {
        const burialSiteTypeFieldIds = (updateForm.burialSiteTypeFieldIds ?? '').split(',');
        for (const burialSiteTypeFieldId of burialSiteTypeFieldIds) {
            const fieldValue = updateForm[`fieldValue_${burialSiteTypeFieldId}`];
            await ((fieldValue ?? '') === ''
                ? deleteBurialSiteField(updateForm.burialSiteId, burialSiteTypeFieldId, user, database)
                : addOrUpdateBurialSiteField({
                    burialSiteId: updateForm.burialSiteId,
                    burialSiteTypeFieldId,
                    fieldValue: fieldValue ?? ''
                }, user, database));
        }
    }
    database.release();
    return result.changes > 0;
}
export async function updateBurialSiteStatus(burialSiteId, burialSiteStatusId, user) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update BurialSites
        set burialSiteStatusId = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where burialSiteId = ?
        and recordDelete_timeMillis is null`)
        .run(burialSiteStatusId === '' ? undefined : burialSiteStatusId, user.userName, rightNowMillis, burialSiteId);
    database.release();
    return result.changes > 0;
}
