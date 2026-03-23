import sqlite from 'better-sqlite3';
import { buildBurialSiteName } from '../helpers/burialSites.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import getCemetery from './getCemetery.js';
export default function rebuildBurialSiteNames(cemeteryId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const cemetery = getCemetery(cemeteryId, database);
    if (cemetery === undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return 0;
    }
    const result = database
        .function('buildBurialSiteName', buildBurialSiteNameUserFunction)
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
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(cemetery.cemeteryKey, user.userName, Date.now(), cemeteryId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes;
}
function buildBurialSiteNameUserFunction(cemeteryKey, burialSiteNameSegment1, burialSiteNameSegment2, burialSiteNameSegment3, burialSiteNameSegment4, burialSiteNameSegment5) {
    return buildBurialSiteName(cemeteryKey, {
        burialSiteNameSegment1,
        burialSiteNameSegment2,
        burialSiteNameSegment3,
        burialSiteNameSegment4,
        burialSiteNameSegment5
    });
}
