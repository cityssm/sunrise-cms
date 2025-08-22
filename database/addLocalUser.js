import sqlite from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { sunriseDB } from '../helpers/database.helpers.js';
export function addLocalUser(options, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const passwordHash = bcrypt.hashSync(options.password, 10);
    const result = database
        .prepare(`INSERT INTO Users (
        userName, displayName, passwordHash, isActive,
        canUpdateCemeteries, canUpdateContracts, canUpdateWorkOrders, isAdmin,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis
      ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(options.userName, options.displayName || null, passwordHash, options.canUpdateCemeteries ? 1 : 0, options.canUpdateContracts ? 1 : 0, options.canUpdateWorkOrders ? 1 : 0, options.isAdmin ? 1 : 0, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.lastInsertRowid;
}
export default addLocalUser;
