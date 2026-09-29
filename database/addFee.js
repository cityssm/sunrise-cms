import { DatabaseSync } from 'node:sqlite';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getFee from './getFee.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addFee(feeForm, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        Fees (
          feeCategoryId,
          feeName,
          feeDescription,
          feeAccount,
          contractTypeId,
          burialSiteTypeId,
          feeAmount,
          feeFunction,
          taxAmount,
          taxPercentage,
          includeQuantity,
          quantityUnit,
          isRequired,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
    `)
        .run(feeForm.feeCategoryId, feeForm.feeName, feeForm.feeDescription, feeForm.feeAccount, feeForm.contractTypeId === '' ? null : feeForm.contractTypeId, feeForm.burialSiteTypeId === '' ? null : feeForm.burialSiteTypeId, feeForm.feeAmount === undefined || feeForm.feeAmount === ''
        ? null
        : feeForm.feeAmount, feeForm.feeFunction ?? null, feeForm.taxAmount === undefined || feeForm.taxAmount === ''
        ? null
        : feeForm.taxAmount, feeForm.taxPercentage === undefined || feeForm.taxPercentage === ''
        ? null
        : feeForm.taxPercentage, (feeForm.includeQuantity ?? '') === '' ? 0 : 1, feeForm.quantityUnit ?? '', (feeForm.isRequired ?? '') === '' ? 0 : 1, feeForm.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    if (isAuditLoggingEnabled) {
        const recordAfter = getFee(result.lastInsertRowid, database);
        createAuditLogEntries({
            mainRecordId: result.lastInsertRowid,
            mainRecordType: 'fee',
            updateTable: 'Fees'
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
    return result.lastInsertRowid;
}
