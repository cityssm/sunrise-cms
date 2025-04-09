import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import getCemetery from './getCemetery.js';
import { acquireConnection } from './pool.js';
export default async function rebuildBurialSiteNames(cemeteryId, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    /*
     * Get the cemetery key
     */
    const cemetery = await getCemetery(cemeteryId, database);
    if (cemetery === undefined) {
        if (connectedDatabase === undefined) {
            database.release();
        }
        return 0;
    }
    const result = database
        .function('buildBurialSiteName', buildBurialSiteNameUserFunction)
        .prepare(`update BurialSites
        set burialSiteName = buildBurialSiteName(?, burialSiteNameSegment1, burialSiteNameSegment2, burialSiteNameSegment3, burialSiteNameSegment4, burialSiteNameSegment5),
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`)
        .run(cemetery.cemeteryKey, user.userName, Date.now(), cemeteryId);
    if (connectedDatabase === undefined) {
        database.release();
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
