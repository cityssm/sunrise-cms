import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteCemetery(cemeteryId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    /*
     * Ensure no active contracts reference the cemetery
     */
    const currentDateInteger = dateToInteger(new Date());
    const activeContract = database
        .prepare(`select contractId
        from Contracts
        where burialSiteId in (
          select burialSiteId from BurialSites where recordDelete_timeMillis is null and cemeteryId = ?)
        and recordDelete_timeMillis is null
        and (contractEndDate is null or contractEndDate >= ?)`)
        .pluck()
        .get(cemeteryId, currentDateInteger);
    if (activeContract !== undefined) {
        if (connectedDatabase === undefined) {

          database.close()

        }
        return false;
    }
    /*
     * Delete the cemetery
     */
    const rightNowMillis = Date.now();
    database
        .prepare(`update Cemeteries
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, cemeteryId);
    /*
     * Delete burial sites, fields, and comments
     */
    const deletedBurialSites = database
        .prepare(`update BurialSites
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, cemeteryId).changes;
    database
        .prepare(`update BurialSiteFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId in (
          select burialSiteId from BurialSites where cemeteryId = ?)
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, cemeteryId);
    database
        .prepare(`update BurialSiteComments
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId in (
          select burialSiteId from BurialSites where cemeteryId = ?)
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, cemeteryId);
    if (deletedBurialSites === 0) {
        const purgeTables = ['CemeteryDirectionsOfArrival', 'Cemeteries'];
        for (const tableName of purgeTables) {
            database
                .prepare(`delete from ${tableName}
            where cemeteryId = ?
            and cemeteryId not in (select cemeteryId from BurialSites)`)
                .run(cemeteryId);
        }
    }
    if (connectedDatabase === undefined) {

      database.close()

    }
    return true;
}
