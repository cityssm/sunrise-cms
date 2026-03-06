import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getUser from './getUser.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export function deleteLocalUser(userName, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? getUser(userName, database)
        : undefined;
    const rightNowMillis = Date.now();
    const result = database
        .prepare(/* sql */ `
      UPDATE Users
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        userName = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, userName);
    if (result.changes > 0 && auditLogIsEnabled) {
        createAuditLogEntries({
            mainRecordId: userName,
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
