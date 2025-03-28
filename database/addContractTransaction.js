import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function addContractTransaction(contractTransactionForm, user) {
    const database = await acquireConnection();
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
    const transactionDate = contractTransactionForm.transactionDateString
        ? dateStringToInteger(contractTransactionForm.transactionDateString)
        : dateToInteger(rightNow);
    const transactionTime = contractTransactionForm.transactionTimeString
        ? timeStringToInteger(contractTransactionForm.transactionTimeString)
        : dateToTimeInteger(rightNow);
    database
        .prepare(`insert into ContractTransactions (
        contractId, transactionIndex,
        transactionDate, transactionTime,
        transactionAmount, externalReceiptNumber, transactionNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(contractTransactionForm.contractId, transactionIndex, transactionDate, transactionTime, contractTransactionForm.transactionAmount, contractTransactionForm.externalReceiptNumber, contractTransactionForm.transactionNote, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    database.release();
    return transactionIndex;
}
