import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateContractType(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            ContractTypes
          WHERE
            contractTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(updateForm.contractTypeId)
        : undefined;
    const result = database
        .prepare(`
      UPDATE ContractTypes
      SET
        contractType = ?,
        isPreneed = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractTypeId = ?
    `)
        .run(updateForm.contractType, updateForm.isPreneed === undefined ? 0 : 1, user.userName, rightNowMillis, updateForm.contractTypeId);
    if (result.changes > 0 && auditLogIsEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          ContractTypes
        WHERE
          contractTypeId = ?
      `)
            .get(updateForm.contractTypeId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: updateForm.contractTypeId,
                mainRecordType: 'contractType',
                updateTable: 'ContractTypes'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('ContractTypes');
    return result.changes > 0;
}
