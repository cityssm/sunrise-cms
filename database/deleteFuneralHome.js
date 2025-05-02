import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteFuneralHome(funeralHomeId, user) {
    const database = sqlite(sunriseDB);
    /*
     * Ensure no open contracts have current or upcoming funeral dates
     * associated with the funeral home
     */
    const currentDateInteger = dateToInteger(new Date());
    const activeContract = database
        .prepare(`select contractId
        from Contracts
        where funeralHomeId = ?
        and recordDelete_timeMillis is null
        and (contractEndDate is null or contractEndDate >= ?)
        and funeralDate >= ?`)
        .pluck()
        .get(funeralHomeId, currentDateInteger, currentDateInteger);
    if (activeContract !== undefined) {
        database.close();
        return false;
    }
    /*
     * Delete the cemetery
     */
    const rightNowMillis = Date.now();
    database
        .prepare(`update FuneralHomes
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where funeralHomeId = ?
        and recordDelete_timeMillis is null`)
        .run(user.userName, rightNowMillis, funeralHomeId);
    database.close();
    return true;
}
