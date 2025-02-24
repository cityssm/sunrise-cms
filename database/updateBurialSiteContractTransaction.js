import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function updateBurialSiteContractTransaction(updateForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update BurialSiteContractTransactions
        set transactionAmount = ?,
        externalReceiptNumber = ?,
        transactionNote = ?,
        transactionDate = ?,
        transactionTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
        and transactionIndex = ?`)
        .run(updateForm.transactionAmount, updateForm.externalReceiptNumber, updateForm.transactionNote, dateStringToInteger(updateForm.transactionDateString), timeStringToInteger(updateForm.transactionTimeString), user.userName, Date.now(), updateForm.burialSiteContractId, updateForm.transactionIndex);
    database.release();
    return result.changes > 0;
}
