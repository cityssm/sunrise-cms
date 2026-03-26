import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getUser from './getUser.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
function insertNewUser(options, user, database) {
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        Users (
          userName,
          isActive,
          canUpdateCemeteries,
          canUpdateContracts,
          canUpdateWorkOrders,
          isAdmin,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(options.userName, 1, options.canUpdateCemeteries ? 1 : 0, options.canUpdateContracts ? 1 : 0, options.canUpdateWorkOrders ? 1 : 0, options.isAdmin ? 1 : 0, user.userName, rightNowMillis, user.userName, rightNowMillis);
    return result.changes > 0;
}
function restoreDeletedUser(options, user, database) {
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      UPDATE Users
      SET
        isActive = ?,
        canUpdateCemeteries = ?,
        canUpdateContracts = ?,
        canUpdateWorkOrders = ?,
        isAdmin = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        userName = ?
    `)
        .run(1, options.canUpdateCemeteries ? 1 : 0, options.canUpdateContracts ? 1 : 0, options.canUpdateWorkOrders ? 1 : 0, options.isAdmin ? 1 : 0, user.userName, rightNowMillis, options.userName);
    return result.changes > 0;
}
export default function addUser(options, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordDeleteTimeMillis = database
        .prepare(`
      SELECT
        recordDelete_timeMillis
      FROM
        Users
      WHERE
        userName = ?
    `)
        .pluck()
        .get(options.userName);
    let success = false;
    if (recordDeleteTimeMillis === undefined) {
        success = insertNewUser(options, user, database);
    }
    else if (recordDeleteTimeMillis !== null) {
        success = restoreDeletedUser(options, user, database);
    }
    if (success && auditLogIsEnabled) {
        const recordAfter = getUser(options.userName, database);
        createAuditLogEntries({
            mainRecordId: options.userName,
            mainRecordType: 'user',
            updateTable: 'Users'
        }, [
            {
                property: '*',
                type: 'created',
                from: undefined,
                to: recordAfter
            }
        ], user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return success;
}
