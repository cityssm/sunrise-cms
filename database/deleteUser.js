import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export function deleteLocalUser(userName, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`UPDATE Users SET 
       recordDelete_userName = ?, recordDelete_timeMillis = ?
       WHERE userName = ? AND recordDelete_timeMillis IS NULL`)
        .run(user.userName, rightNowMillis, userName);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
export default deleteLocalUser;
