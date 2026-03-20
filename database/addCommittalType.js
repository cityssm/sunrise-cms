import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addCommittalType(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        CommittalTypes (
          committalType,
          committalTypeKey,
          orderNumber,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
        .run(addForm.committalType, addForm.committalTypeKey ?? '', addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    const committalTypeId = result.lastInsertRowid;
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          CommittalTypes
        WHERE
          committalTypeId = ?
      `)
            .get(committalTypeId);
        createAuditLogEntries({
            mainRecordId: committalTypeId,
            mainRecordType: 'committalType',
            updateTable: 'CommittalTypes'
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
    clearCacheByTableName('CommittalTypes');
    return committalTypeId;
}
