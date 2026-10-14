import getObjectDifference from '@cityssm/object-difference';
import { isAuditLoggingEnabled } from '../helpers/config.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getUser from './getUser.js';
export default function updateUser(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const recordBefore = isAuditLoggingEnabled
        ? getUser(updateForm.username, database)
        : undefined;
    const rightNowMillis = Date.now();
    let query = `
    UPDATE Users
    SET
      isActive = ?,
      canUpdateCemeteries = ?,
      canUpdateContracts = ?,
      canUpdateWorkOrders = ?,
      isAdmin = ?,
      recordUpdate_username = ?,
      recordUpdate_timeMillis = ?
  `;
    const parameters = [
        updateForm.isActive ? 1 : 0,
        updateForm.canUpdateCemeteries ? 1 : 0,
        updateForm.canUpdateContracts ? 1 : 0,
        updateForm.canUpdateWorkOrders ? 1 : 0,
        updateForm.isAdmin ? 1 : 0,
        user.username,
        rightNowMillis
    ];
    query += ' WHERE username = ? AND recordDelete_timeMillis IS NULL';
    parameters.push(updateForm.username);
    const result = database.prepare(query).run(...parameters);
    if (isAuditLoggingEnabled) {
        const recordAfter = getUser(updateForm.username, database);
        const userDifferences = getObjectDifference(recordBefore, recordAfter);
        if (userDifferences.length > 0) {
            createAuditLogEntries({
                mainRecordId: updateForm.username,
                mainRecordType: 'user',
                updateTable: 'Users'
            }, userDifferences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
