import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { isAuditLoggingEnabled } from '../helpers/config.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
import { startSyncDataToPortalTask } from '../integrations/portal/taskStart.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
export default function addContractType(form, user, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        ContractTypes (
          contractType,
          isPreneed,
          isAvailableOnPortal,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(form.contractType, form.isPreneed === undefined ? 0 : 1, form.isAvailableOnPortal ?? '0', form.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    if (isAuditLoggingEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          ContractTypes
        WHERE
          contractTypeId = ?
      `)
            .get(result.lastInsertRowid);
        createAuditLogEntries({
            mainRecordId: String(result.lastInsertRowid),
            mainRecordType: 'contractType',
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
    if (form.isAvailableOnPortal === '1') {
        startSyncDataToPortalTask();
    }
    return result.lastInsertRowid;
}
