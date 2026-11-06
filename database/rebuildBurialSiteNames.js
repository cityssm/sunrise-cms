import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
import getCemetery from './getCemetery.js';
export default function rebuildBurialSiteNames(cemeteryId, user, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const cemetery = getCemetery(cemeteryId, database);
    if (cemetery === undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return 0;
    }
    database.function('buildBurialSiteName', {
        deterministic: true
    }, buildBurialSiteNameUserFunction);
    const result = database
        .prepare(`
      UPDATE BurialSites
      SET
        burialSiteName = buildBurialSiteName (
          ?,
          burialSiteNameSegment1,
          burialSiteNameSegment2,
          burialSiteNameSegment3,
          burialSiteNameSegment4,
          burialSiteNameSegment5
        ),
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(cemetery.cemeteryKey, user.username, Date.now(), cemeteryId);
    database.exec('pragma optimize');
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes;
}
function buildBurialSiteNameUserFunction(cemeteryKey, burialSiteNameSegment1DatabaseValue, burialSiteNameSegment2DatabaseValue, burialSiteNameSegment3DatabaseValue, burialSiteNameSegment4DatabaseValue, burialSiteNameSegment5DatabaseValue) {
    return buildBurialSiteName(cemeteryKey, {
        burialSiteNameSegment1: burialSiteNameSegment1DatabaseValue,
        burialSiteNameSegment2: burialSiteNameSegment2DatabaseValue,
        burialSiteNameSegment3: burialSiteNameSegment3DatabaseValue,
        burialSiteNameSegment4: burialSiteNameSegment4DatabaseValue,
        burialSiteNameSegment5: burialSiteNameSegment5DatabaseValue
    });
}
