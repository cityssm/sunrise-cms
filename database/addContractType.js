import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addContractType(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(/* sql */ `
      INSERT INTO
        ContractTypes (
          contractType,
          isPreneed,
          orderNumber,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
        .run(addForm.contractType, addForm.isPreneed === undefined ? 0 : 1, addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(/* sql */ `
        SELECT
          *
        FROM
          ContractTypes
        WHERE
          contractTypeId = ?
      `)
            .get(result.lastInsertRowid);
        createAuditLogEntries({
            mainRecordType: 'contractType',
            mainRecordId: String(result.lastInsertRowid),
            updateTable: 'ContractTypes'
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
    clearCacheByTableName('ContractTypes');
    return result.lastInsertRowid;
}
