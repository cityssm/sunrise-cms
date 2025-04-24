import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export function deleteBurialSite(burialSiteId, user) {
    const database = sqlite(sunriseDB);
    /*
     * Ensure no active contracts reference the burial site
     */
    const currentDateInteger = dateToInteger(new Date());
    const activeContract = database
        .prepare(`select contractId
        from Contracts
        where burialSiteId = ?
        and recordDelete_timeMillis is null
        and (contractEndDate is null or contractEndDate >= ?)`)
        .pluck()
        .get(burialSiteId, currentDateInteger);
    if (activeContract !== undefined) {
        database.close();
        return false;
    }
    /*
     * Delete the burial site
     */
    const rightNowMillis = Date.now();
    database
        .prepare(`update BurialSites
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId = ?
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, burialSiteId);
    /*
     * Delete fields and comments
     */
    database
        .prepare(`update BurialSiteFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId = ?
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, burialSiteId);
    database
        .prepare(`update BurialSiteComments
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId = ?
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, burialSiteId);
    database.close();
    return true;
}
