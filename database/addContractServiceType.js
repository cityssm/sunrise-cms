import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addContractServiceType(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const existingRecord = database
        .prepare(`
      SELECT
        recordDelete_timeMillis
      FROM
        ContractServiceTypes
      WHERE
        contractId = ?
        AND serviceTypeId = ?
    `)
        .get(form.contractId, form.serviceTypeId);
    if (existingRecord !== undefined &&
        existingRecord.recordDelete_timeMillis === undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return false;
    }
    let insertResult;
    if (existingRecord === undefined) {
        insertResult = database
            .prepare(`
        INSERT INTO
          ContractServiceTypes (
            contractId,
            serviceTypeId,
            contractServiceDetails,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
            .run(form.contractId, form.serviceTypeId, form.contractServiceDetails ?? '', user.username, rightNowMillis, user.username, rightNowMillis);
    }
    else {
        insertResult = database
            .prepare(`
        UPDATE ContractServiceTypes
        SET
          contractServiceDetails = ?,
          recordDelete_username = NULL,
          recordDelete_timeMillis = NULL,
          recordUpdate_username = ?,
          recordUpdate_timeMillis = ?
        WHERE
          contractId = ?
          AND serviceTypeId = ?
      `)
            .run(form.contractServiceDetails ?? '', user.username, rightNowMillis, form.contractId, form.serviceTypeId);
    }
    if (isAuditLoggingEnabled && insertResult.changes > 0) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          ContractServiceTypes
        WHERE
          contractId = ?
          AND serviceTypeId = ?
      `)
            .get(form.contractId, form.serviceTypeId);
        createAuditLogEntries({
            mainRecordId: form.contractId,
            mainRecordType: 'contract',
            recordIndex: form.serviceTypeId,
            updateTable: 'ContractServiceTypes'
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
    return insertResult.changes > 0;
}
