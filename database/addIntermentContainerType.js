import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addIntermentContainerType(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        IntermentContainerTypes (
          intermentContainerType,
          intermentContainerTypeKey,
          isCremationType,
          isAvailableOnPortal,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(form.intermentContainerType, form.intermentContainerTypeKey ?? '', form.isCremationType ?? '0', form.isAvailableOnPortal ?? '0', form.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    const intermentContainerTypeId = result.lastInsertRowid;
    if (isAuditLoggingEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          IntermentContainerTypes
        WHERE
          intermentContainerTypeId = ?
      `)
            .get(intermentContainerTypeId);
        createAuditLogEntries({
            mainRecordId: intermentContainerTypeId,
            mainRecordType: 'intermentContainerType',
            updateTable: 'IntermentContainerTypes'
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
    clearCacheByTableName('IntermentContainerTypes');
    return intermentContainerTypeId;
}
