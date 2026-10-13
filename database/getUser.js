import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getUser(username, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    const user = database
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
        username = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .get(username);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return user;
}
