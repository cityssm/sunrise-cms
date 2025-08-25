import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateUser(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    let query = `UPDATE Users SET 
    isActive = ?,
    canUpdateCemeteries = ?, canUpdateContracts = ?, canUpdateWorkOrders = ?, isAdmin = ?,
    recordUpdate_userName = ?, recordUpdate_timeMillis = ?`;
    const parameters = [
        updateForm.isActive ? 1 : 0,
        updateForm.canUpdateCemeteries ? 1 : 0,
        updateForm.canUpdateContracts ? 1 : 0,
        updateForm.canUpdateWorkOrders ? 1 : 0,
        updateForm.isAdmin ? 1 : 0,
        user.userName,
        rightNowMillis
    ];
    query += ' WHERE userName = ? AND recordDelete_timeMillis IS NULL';
    parameters.push(updateForm.userName);
    const result = database.prepare(query).run(...parameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
