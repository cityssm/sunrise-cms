import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addContractTransaction(contractTransactionForm, user) {
    const database = sqlite(sunriseDB);
    let transactionIndex = 0;
    const maxIndexResult = database
        .prepare(`select transactionIndex
        from ContractTransactions
        where contractId = ?
        order by transactionIndex desc
        limit 1`)
        .get(contractTransactionForm.contractId);
    if (maxIndexResult !== undefined) {
        transactionIndex = maxIndexResult.transactionIndex + 1;
    }
    const rightNow = new Date();
    const transactionDate = contractTransactionForm.transactionDateString === ''
        ? dateToInteger(rightNow)
        : dateStringToInteger(contractTransactionForm.transactionDateString);
    const transactionTime = contractTransactionForm.transactionTimeString === ''
        ? dateToTimeInteger(rightNow)
        : timeStringToInteger(contractTransactionForm.transactionTimeString);
    database
        .prepare(`insert into ContractTransactions (
        contractId, transactionIndex,
        transactionDate, transactionTime,
        transactionAmount, externalReceiptNumber, transactionNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(contractTransactionForm.contractId, transactionIndex, transactionDate, transactionTime, contractTransactionForm.transactionAmount, contractTransactionForm.externalReceiptNumber, contractTransactionForm.transactionNote, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    database.close();
    return transactionIndex;
}
