import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getUser(userName, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const user = database
        .prepare(`select userName, isActive,
          canUpdateCemeteries, canUpdateContracts, canUpdateWorkOrders, isAdmin,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis
        from Users
        where userName = ?
          and recordDelete_timeMillis is null`)
        .get(userName);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return user;
}
