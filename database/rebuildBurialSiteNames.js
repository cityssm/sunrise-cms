import sqlite from 'better-sqlite3';
import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import getCemetery from './getCemetery.js';
export default function rebuildBurialSiteNames(cemeteryId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    /*
     * Get the cemetery key
     */
    const cemetery = getCemetery(cemeteryId, database);
    if (cemetery === undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return 0;
    }
    const result = database
        .function('buildBurialSiteName', buildBurialSiteNameUserFunction)
        .prepare(/* sql */ `update BurialSites
        set burialSiteName = buildBurialSiteName(?, burialSiteNameSegment1, burialSiteNameSegment2, burialSiteNameSegment3, burialSiteNameSegment4, burialSiteNameSegment5),
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`)
        .run(cemetery.cemeteryKey, user.userName, Date.now(), cemeteryId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes;
}
// eslint-disable-next-line @typescript-eslint/max-params
function buildBurialSiteNameUserFunction(cemeteryKey, burialSiteNameSegment1, burialSiteNameSegment2, burialSiteNameSegment3, burialSiteNameSegment4, burialSiteNameSegment5) {
    return buildBurialSiteName(cemeteryKey, {
        burialSiteNameSegment1,
        burialSiteNameSegment2,
        burialSiteNameSegment3,
        burialSiteNameSegment4,
        burialSiteNameSegment5
    });
}
