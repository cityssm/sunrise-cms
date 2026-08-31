import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addContractTransaction(contractTransactionForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    let transactionIndex = 0;
    const maxIndexResult = database
        .prepare(`
      SELECT
        transactionIndex
      FROM
        ContractTransactions
      WHERE
        contractId = ?
      ORDER BY
        transactionIndex DESC
      LIMIT
        1
    `)
        .get(contractTransactionForm.contractId);
    if (maxIndexResult !== undefined) {
        transactionIndex = maxIndexResult.transactionIndex + 1;
    }
    const rightNow = new Date();
    const transactionDate = (contractTransactionForm.transactionDateString ?? '') === ''
        ? dateToInteger(rightNow)
        : dateStringToInteger(contractTransactionForm.transactionDateString);
    const transactionTime = (contractTransactionForm.transactionTimeString ?? '') === ''
        ? dateToTimeInteger(rightNow)
        : timeStringToInteger(contractTransactionForm.transactionTimeString);
    database
        .prepare(`
      INSERT INTO
        ContractTransactions (
          contractId,
          transactionIndex,
          transactionDate,
          transactionTime,
          transactionAmount,
          isInvoiced,
          externalReceiptNumber,
          transactionNote,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(contractTransactionForm.contractId, transactionIndex, transactionDate, transactionTime, contractTransactionForm.transactionAmount, contractTransactionForm.isInvoiced ?? 0, contractTransactionForm.externalReceiptNumber, contractTransactionForm.transactionNote, user.username, rightNow.getTime(), user.username, rightNow.getTime());
    if (isAuditLoggingEnabled) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          ContractTransactions
        WHERE
          contractId = ?
          AND transactionIndex = ?
      `)
            .get(contractTransactionForm.contractId, transactionIndex);
        createAuditLogEntries({
            mainRecordId: contractTransactionForm.contractId,
            mainRecordType: 'contract',
            recordIndex: transactionIndex,
            updateTable: 'ContractTransactions'
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
    return transactionIndex;
}
