import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getUsers(connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    const users = database
        .prepare(`
      SELECT
        username,
        isActive,
        canUpdateCemeteries,
        canUpdateContracts,
        canUpdateWorkOrders,
        isAdmin,
        recordCreate_username,
        recordCreate_timeMillis,
        recordUpdate_username,
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
