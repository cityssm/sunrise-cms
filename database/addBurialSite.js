import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import addOrUpdateBurialSiteField from './addOrUpdateBurialSiteField.js';
import getCemetery from './getCemetery.js';
import { acquireConnection } from './pool.js';
export default async function addBurialSite(burialSiteForm, user) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    const cemetery = burialSiteForm.cemeteryId === '' ? undefined : await getCemetery(burialSiteForm.cemeteryId, database);
    const burialSiteName = buildBurialSiteName(cemetery?.cemeteryKey, burialSiteForm);
    const result = database
        .prepare(`insert into BurialSites (
        burialSiteNameSegment1,
        burialSiteNameSegment2,
        burialSiteNameSegment3,
        burialSiteNameSegment4,
        burialSiteNameSegment5,
        burialSiteName,
        burialSiteTypeId, burialSiteStatusId,
        cemeteryId, cemeterySvgId,
        burialSiteLatitude, burialSiteLongitude,

        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis) 
        values (?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?)`)
        .run(burialSiteForm.burialSiteNameSegment1, burialSiteForm.burialSiteNameSegment2 ?? '', burialSiteForm.burialSiteNameSegment3 ?? '', burialSiteForm.burialSiteNameSegment4 ?? '', burialSiteForm.burialSiteNameSegment5 ?? '', burialSiteName, burialSiteForm.burialSiteTypeId, burialSiteForm.burialSiteStatusId === '' ? undefined : burialSiteForm.burialSiteStatusId, burialSiteForm.cemeteryId === '' ? undefined : burialSiteForm.cemeteryId, burialSiteForm.cemeterySvgId, burialSiteForm.burialSiteLatitude === '' ? undefined : burialSiteForm.burialSiteLatitude, burialSiteForm.burialSiteLongitude === '' ? undefined : burialSiteForm.burialSiteLongitude, user.userName, rightNowMillis, user.userName, rightNowMillis);
    const burialSiteId = result.lastInsertRowid;
    const burialSiteTypeFieldIds = (burialSiteForm.burialSiteTypeFieldIds ?? '').split(',');
    for (const burialSiteTypeFieldId of burialSiteTypeFieldIds) {
        const fieldValue = burialSiteForm[`burialSiteFieldValue_${burialSiteTypeFieldId}`];
        if ((fieldValue ?? '') !== '') {
            await addOrUpdateBurialSiteField({
                burialSiteId,
                burialSiteTypeFieldId,
                fieldValue: fieldValue ?? ''
            }, user, database);
        }
    }
    database.release();
    return burialSiteId;
}
