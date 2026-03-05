import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addContractTransaction(contractTransactionForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    let transactionIndex = 0;
    const maxIndexResult = database
        .prepare(/* sql */ `
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
        .prepare(/* sql */ `
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
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(contractTransactionForm.contractId, transactionIndex, transactionDate, transactionTime, contractTransactionForm.transactionAmount, contractTransactionForm.isInvoiced ?? 0, contractTransactionForm.externalReceiptNumber, contractTransactionForm.transactionNote, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(
        /* sql */ `SELECT * FROM ContractTransactions WHERE contractId = ? AND transactionIndex = ?`)
            .get(contractTransactionForm.contractId, transactionIndex);
        createAuditLogEntries({
            mainRecordType: 'contract',
            mainRecordId: String(contractTransactionForm.contractId),
            updateTable: 'ContractTransactions',
            recordIndex: String(transactionIndex)
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
