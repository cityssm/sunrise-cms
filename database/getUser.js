import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getUser(username, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const user = database
        .prepare(`
      SELECT
        userName AS username,
        isActive,
        canUpdateCemeteries,
        canUpdateContracts,
        canUpdateWorkOrders,
        isAdmin,
        recordCreate_userName AS recordCreate_username,
        recordCreate_timeMillis,
        recordUpdate_userName AS recordUpdate_username,
        recordUpdate_timeMillis
      FROM
        Users
      WHERE
        userName = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .get(username);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return user;
}
