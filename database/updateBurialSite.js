import addOrUpdateBurialSiteField from './addOrUpdateBurialSiteField.js';
import deleteBurialSiteField from './deleteBurialSiteField.js';
import { acquireConnection } from './pool.js';
export default async function updateBurialSite(updateForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update BurialSites
        set burialSiteNameSegment1 = ?,
        burialSiteNameSegment2 = ?,
        burialSiteNameSegment3 = ?,
        burialSiteNameSegment4 = ?,
        burialSiteNameSegment5 = ?,
        burialSiteTypeId = ?,
        burialSiteStatusId = ?,
        cemeteryId = ?,
        cemeterySvgId = ?,
        burialSiteLatitude = ?,
        burialSiteLongitude = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where lotId = ?
        and recordDelete_timeMillis is null`)
        .run(updateForm.burialSiteNameSegment1, updateForm.burialSiteNameSegment2 ?? '', updateForm.burialSiteNameSegment3 ?? '', updateForm.burialSiteNameSegment4 ?? '', updateForm.burialSiteNameSegment5 ?? '', updateForm.burialSiteTypeId, updateForm.burialSiteStatusId === ''
        ? undefined
        : updateForm.burialSiteStatusId, updateForm.cemeteryId === '' ? undefined : updateForm.cemeteryId, updateForm.cemeterySvgId, updateForm.burialSiteLatitude === ''
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
