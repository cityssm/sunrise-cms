import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export function restoreBurialSite(burialSiteId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(/* sql */ `
      UPDATE BurialSites
      SET
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NOT NULL
    `)
        .run(user.userName, rightNowMillis, burialSiteId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
