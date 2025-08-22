import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export function getLocalUsers(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const users = database
        .prepare(`SELECT userId, userName, displayName, isActive,
              canUpdateCemeteries, canUpdateContracts, canUpdateWorkOrders, isAdmin,
              recordCreate_userName, recordCreate_timeMillis,
              recordUpdate_userName, recordUpdate_timeMillis
       FROM Users
       WHERE recordDelete_timeMillis IS NULL
       ORDER BY userName`)
        .all();
    if (connectedDatabase === undefined) {
        database.close();
    }
    return users;
}
export function getLocalUser(userName, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const user = database
        .prepare(`SELECT userId, userName, displayName, isActive,
              canUpdateCemeteries, canUpdateContracts, canUpdateWorkOrders, isAdmin,
              recordCreate_userName, recordCreate_timeMillis,
              recordUpdate_userName, recordUpdate_timeMillis
       FROM Users
       WHERE userName = ? AND recordDelete_timeMillis IS NULL`)
        .get(userName);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return user;
}
export default getLocalUsers;
