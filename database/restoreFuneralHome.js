import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export function restoreFuneralHome(funeralHomeId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update FuneralHomes
        set recordDelete_userName = null,
          recordDelete_timeMillis = null,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where funeralHomeId = ?
          and recordDelete_timeMillis is not null`)
        .run(user.userName, rightNowMillis, funeralHomeId);
    if (connectedDatabase === undefined) {

      database.close()

    }
    return result.changes > 0;
}
