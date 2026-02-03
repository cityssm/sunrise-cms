import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getUsers(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const users = database
        .prepare(/* sql */ `select userName, isActive,
          canUpdateCemeteries, canUpdateContracts, canUpdateWorkOrders, isAdmin,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis
        from Users
        where recordDelete_timeMillis is null
        order by userName`)
        .all();
    if (connectedDatabase === undefined) {
        database.close();
    }
    return users;
}
