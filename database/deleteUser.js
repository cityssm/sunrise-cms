import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getUser from './getUser.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export function deleteLocalUser(username, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = isAuditLoggingEnabled
        ? getUser(username, database)
        : undefined;
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      UPDATE Users
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        username = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.username, rightNowMillis, username);
    if (result.changes > 0 && isAuditLoggingEnabled) {
        createAuditLogEntries({
            mainRecordId: username,
            mainRecordType: 'user',
            updateTable: 'Users'
        }, [
            {
                property: '*',
                type: 'deleted',
                from: recordBefore,
                to: undefined
            }
        ], user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
export default deleteLocalUser;
