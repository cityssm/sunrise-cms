import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractTransaction(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(/* sql */ `
      UPDATE ContractTransactions
      SET
        transactionAmount = ?,
        isInvoiced = ?,
        externalReceiptNumber = ?,
        transactionNote = ?,
        transactionDate = ?,
        transactionTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
        AND transactionIndex = ?
    `)
        .run(updateForm.transactionAmount, updateForm.isInvoiced ?? 0, updateForm.externalReceiptNumber, updateForm.transactionNote, dateStringToInteger(updateForm.transactionDateString), timeStringToInteger(updateForm.transactionTimeString), user.userName, Date.now(), updateForm.contractId, updateForm.transactionIndex);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
