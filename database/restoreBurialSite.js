import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export function restoreBurialSite(burialSiteId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update BurialSites
        set recordDelete_userName = null,
          recordDelete_timeMillis = null,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where burialSiteId = ?
          and recordDelete_timeMillis is not null`)
        .run(user.userName, rightNowMillis, burialSiteId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
