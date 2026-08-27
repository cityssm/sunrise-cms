import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getUsers(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const users = database
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
        recordDelete_timeMillis IS NULL
      ORDER BY
        username
    `)
        .all();
    if (connectedDatabase === undefined) {
        database.close();
    }
    return users;
}
