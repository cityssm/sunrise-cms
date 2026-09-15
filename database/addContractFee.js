import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { calculateFeeAmount, calculateTaxAmount } from '../helpers/functions.fee.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getContract from './getContract.js';
import getFee from './getFee.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
async function determineFeeTaxAmounts(form, database) {
    let feeAmount;
    let taxAmount;
    if ((form.feeAmount ?? '') === '') {
        const contract = (await getContract(form.contractId, database));
        const fee = getFee(form.feeId);
        feeAmount = calculateFeeAmount(fee, contract);
        taxAmount = calculateTaxAmount(fee, feeAmount);
    }
    else {
        feeAmount = typeof form.feeAmount === 'string' ? Number(form.feeAmount) : 0;
        taxAmount = typeof form.taxAmount === 'string' ? Number(form.taxAmount) : 0;
    }
    return { feeAmount, taxAmount };
}
export default async function addContractFee(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const { feeAmount, taxAmount } = await determineFeeTaxAmounts(form, database);
    try {
        const record = database
            .prepare(`
        SELECT
          feeAmount,
          taxAmount,
          recordDelete_timeMillis
        FROM
          ContractFees
        WHERE
          contractId = ?
          AND feeId = ?
      `)
            .get(form.contractId, form.feeId);
        if (record !== undefined) {
            if (record.recordDelete_timeMillis !== null) {
                database
                    .prepare(`
            DELETE FROM ContractFees
            WHERE
              recordDelete_timeMillis IS NOT NULL
              AND contractId = ?
              AND feeId = ?
          `)
                    .run(form.contractId, form.feeId);
            }
            else if (record.feeAmount === feeAmount &&
                record.taxAmount === taxAmount) {
                const recordBefore = isAuditLoggingEnabled
                    ? database
                        .prepare(`
                SELECT
                  *
                FROM
                  ContractFees
                WHERE
                  contractId = ?
                  AND feeId = ?
              `)
                        .get(form.contractId, form.feeId)
                    : undefined;
                database
                    .prepare(`
            UPDATE ContractFees
            SET
              quantity = quantity + ?,
              recordUpdate_username = ?,
              recordUpdate_timeMillis = ?
            WHERE
              contractId = ?
              AND feeId = ?
          `)
                    .run(form.quantity, user.username, rightNowMillis, form.contractId, form.feeId);
                if (isAuditLoggingEnabled) {
                    const recordAfter = database
                        .prepare(`
              SELECT
                *
              FROM
                ContractFees
              WHERE
                contractId = ?
                AND feeId = ?
            `)
                        .get(form.contractId, form.feeId);
                    const differences = getObjectDifference(recordBefore, recordAfter);
                    if (differences.length > 0) {
                        createAuditLogEntries({
                            mainRecordId: form.contractId,
                            mainRecordType: 'contract',
                            recordIndex: form.feeId,
                            updateTable: 'ContractFees'
                        }, differences, user, database);
                    }
                }
                return true;
            }
            else {
                const quantity = typeof form.quantity === 'string'
                    ? Number(form.quantity)
                    : form.quantity;
                const recordBefore = isAuditLoggingEnabled
                    ? database
                        .prepare(`
                SELECT
                  *
                FROM
                  ContractFees
                WHERE
                  contractId = ?
                  AND feeId = ?
              `)
                        .get(form.contractId, form.feeId)
                    : undefined;
                database
                    .prepare(`
            UPDATE ContractFees
            SET
              feeAmount = (feeAmount * quantity) + ?,
              taxAmount = (taxAmount * quantity) + ?,
              quantity = 1,
              recordUpdate_username = ?,
              recordUpdate_timeMillis = ?
            WHERE
              contractId = ?
              AND feeId = ?
          `)
                    .run(feeAmount * quantity, taxAmount * quantity, user.username, rightNowMillis, form.contractId, form.feeId);
                if (isAuditLoggingEnabled) {
                    const recordAfter = database
                        .prepare(`
              SELECT
                *
              FROM
                ContractFees
              WHERE
                contractId = ?
                AND feeId = ?
            `)
                        .get(form.contractId, form.feeId);
                    const differences = getObjectDifference(recordBefore, recordAfter);
                    if (differences.length > 0) {
                        createAuditLogEntries({
                            mainRecordId: form.contractId,
                            mainRecordType: 'contract',
                            recordIndex: form.feeId,
                            updateTable: 'ContractFees'
                        }, differences, user, database);
                    }
                }
                return true;
            }
        }
        const result = database
            .prepare(`
        INSERT INTO
          ContractFees (
            contractId,
            feeId,
            quantity,
            feeAmount,
            taxAmount,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
            .run(form.contractId, form.feeId, form.quantity, feeAmount, taxAmount, user.username, rightNowMillis, user.username, rightNowMillis);
        if (isAuditLoggingEnabled && result.changes > 0) {
            const recordAfter = database
                .prepare(`
          SELECT
            *
          FROM
            ContractFees
          WHERE
            contractId = ?
            AND feeId = ?
        `)
                .get(form.contractId, form.feeId);
            createAuditLogEntries({
                mainRecordId: form.contractId,
                mainRecordType: 'contract',
                recordIndex: form.feeId,
                updateTable: 'ContractFees'
            }, [
                {
                    property: '*',
                    type: 'created',
                    from: undefined,
                    to: recordAfter
                }
            ], user, database);
        }
        return result.changes > 0;
    }
    finally {
        if (connectedDatabase === undefined) {
            database.close();
        }
    }
}
