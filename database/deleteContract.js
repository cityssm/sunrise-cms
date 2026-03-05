import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export function deleteContract(contractId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    /*
     * Ensure no active work orders reference the contract
     */
    const currentDateInteger = dateToInteger(new Date());
    const activeWorkOrder = database
        .prepare(/* sql */ `
      SELECT
        workOrderId
      FROM
        WorkOrders
      WHERE
        recordDelete_timeMillis IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderContracts
          WHERE
            contractId = ?
            AND recordDelete_timeMillis IS NULL
        )
        AND (
          workOrderCloseDate IS NULL
          OR workOrderCloseDate >= ?
        )
    `)
        .pluck()
        .get(contractId, currentDateInteger);
    if (activeWorkOrder !== undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return false;
    }
    /*
     * Delete the contract
     */
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(/* sql */ `
          SELECT
            *
          FROM
            Contracts
          WHERE
            contractId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(contractId)
        : undefined;
    const rightNowMillis = Date.now();
    for (const tableName of ['Contracts', 'ContractFields', 'ContractComments']) {
        database
            .prepare(/* sql */ `
        UPDATE ${tableName}
        SET
          recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        WHERE
          contractId = ?
          AND recordDelete_timeMillis IS NULL
      `)
            .run(user.userName, rightNowMillis, contractId);
    }
    if (auditLogIsEnabled) {
        createAuditLogEntries({
            mainRecordType: 'contract',
            mainRecordId: contractId,
            updateTable: 'Contracts'
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
    return true;
}
