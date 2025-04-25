import sqlite from 'better-sqlite3';
import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import addOrUpdateBurialSiteField from './addOrUpdateBurialSiteField.js';
import getCemetery from './getCemetery.js';
/**
 * Creates a new burial site.
 * @param burialSiteForm - The new burial site's information
 * @param user - The user making the request
 * @returns The new burial site's id.
 * @throws If an active burial site with the same name already exists.
 */
export default function addBurialSite(burialSiteForm, user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const cemetery = burialSiteForm.cemeteryId === ''
        ? undefined
        : getCemetery(burialSiteForm.cemeteryId, database);
    const burialSiteName = buildBurialSiteName(cemetery?.cemeteryKey, burialSiteForm);
    // Ensure no active burial sites share the same name
    const existingBurialSite = database
        .prepare(`select burialSiteId
        from BurialSites
        where burialSiteName = ?
        and recordDelete_timeMillis is null`)
        .pluck()
        .get(burialSiteName);
    if (existingBurialSite !== undefined) {
        database.close();
        throw new Error('An active burial site with that name already exists.');
    }
    const result = database
        .prepare(`insert into BurialSites (
        burialSiteNameSegment1,
        burialSiteNameSegment2,
        burialSiteNameSegment3,
        burialSiteNameSegment4,
        burialSiteNameSegment5,
        burialSiteName,
        burialSiteTypeId, burialSiteStatusId,
        cemeteryId, cemeterySvgId, burialSiteImage,
        burialSiteLatitude, burialSiteLongitude,

        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis) 
        values (?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?)`)
        .run(burialSiteForm.burialSiteNameSegment1 ?? '', burialSiteForm.burialSiteNameSegment2 ?? '', burialSiteForm.burialSiteNameSegment3 ?? '', burialSiteForm.burialSiteNameSegment4 ?? '', burialSiteForm.burialSiteNameSegment5 ?? '', burialSiteName, burialSiteForm.burialSiteTypeId, burialSiteForm.burialSiteStatusId === ''
        ? undefined
        : burialSiteForm.burialSiteStatusId, burialSiteForm.cemeteryId === '' ? undefined : burialSiteForm.cemeteryId, burialSiteForm.cemeterySvgId, burialSiteForm.burialSiteImage ?? '', burialSiteForm.burialSiteLatitude === ''
        ? undefined
        : burialSiteForm.burialSiteLatitude, burialSiteForm.burialSiteLongitude === ''
        ? undefined
        : burialSiteForm.burialSiteLongitude, user.userName, rightNowMillis, user.userName, rightNowMillis);
    const burialSiteId = result.lastInsertRowid;
    const burialSiteTypeFieldIds = (burialSiteForm.burialSiteTypeFieldIds ?? '').split(',');
    for (const burialSiteTypeFieldId of burialSiteTypeFieldIds) {
        const fieldValue = burialSiteForm[`burialSiteFieldValue_${burialSiteTypeFieldId}`];
        if ((fieldValue ?? '') !== '') {
            addOrUpdateBurialSiteField({
                burialSiteId,
                burialSiteTypeFieldId,
                fieldValue: fieldValue ?? ''
            }, user, database);
        }
    }
    database.close();
    return {
        burialSiteId,
        burialSiteName
    };
}
