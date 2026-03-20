import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getFee from './getFee.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateFee(feeForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? getFee(feeForm.feeId, database)
        : undefined;
    const result = database
        .prepare(`
      UPDATE Fees
      SET
        feeCategoryId = ?,
        feeName = ?,
        feeDescription = ?,
        feeAccount = ?,
        contractTypeId = ?,
        burialSiteTypeId = ?,
        feeAmount = ?,
        feeFunction = ?,
        taxAmount = ?,
        taxPercentage = ?,
        includeQuantity = ?,
        quantityUnit = ?,
        isRequired = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND feeId = ?
    `)
        .run(feeForm.feeCategoryId, feeForm.feeName, feeForm.feeDescription, feeForm.feeAccount, feeForm.contractTypeId === '' ? undefined : feeForm.contractTypeId, feeForm.burialSiteTypeId === '' ? undefined : feeForm.burialSiteTypeId, feeForm.feeAmount === undefined || feeForm.feeAmount === ''
        ? 0
        : feeForm.feeAmount, feeForm.feeFunction ?? undefined, feeForm.taxAmount === '' ? undefined : feeForm.taxAmount, feeForm.taxPercentage === '' ? undefined : feeForm.taxPercentage, feeForm.includeQuantity === '' ? 0 : 1, feeForm.quantityUnit, feeForm.isRequired === '' ? 0 : 1, user.userName, Date.now(), feeForm.feeId);
    if (result.changes > 0 && auditLogIsEnabled) {
        const recordAfter = getFee(feeForm.feeId, database);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: feeForm.feeId,
                mainRecordType: 'fee',
                updateTable: 'Fees'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
export function updateFeeAmount(feeAmountForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = auditLogIsEnabled
        ? getFee(feeAmountForm.feeId, database)
        : undefined;
    const result = database
        .prepare(`
      UPDATE Fees
      SET
        feeAmount = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND feeId = ?
    `)
        .run(feeAmountForm.feeAmount, user.userName, Date.now(), feeAmountForm.feeId);
    if (result.changes > 0 && auditLogIsEnabled) {
        const recordAfter = getFee(feeAmountForm.feeId, database);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: feeAmountForm.feeId,
                mainRecordType: 'fee',
                updateTable: 'Fees'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
