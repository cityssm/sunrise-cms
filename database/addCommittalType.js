import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addCommittalType(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        CommittalTypes (
          committalType,
          committalTypeKey,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
        .run(form.committalType, form.committalTypeKey ?? '', form.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    const committalTypeId = result.lastInsertRowid;
    if (isAuditLoggingEnabled) {
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
