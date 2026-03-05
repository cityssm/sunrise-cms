import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addServiceType(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(/* sql */ `
      INSERT INTO
        ServiceTypes (
          serviceType,
          orderNumber,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?)
    `)
        .run(addForm.serviceType, addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    const serviceTypeId = result.lastInsertRowid;
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(/* sql */ `
        SELECT
          *
        FROM
          ServiceTypes
        WHERE
          serviceTypeId = ?
      `)
            .get(serviceTypeId);
        createAuditLogEntries({
            mainRecordType: 'serviceType',
            mainRecordId: String(serviceTypeId),
            updateTable: 'ServiceTypes'
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
    clearCacheByTableName('ServiceTypes');
    return serviceTypeId;
}
