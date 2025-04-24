import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addContractComment(commentForm, user) {
    const rightNow = new Date();
    let commentDate = 0;
    let commentTime = 0;
    if (commentForm.commentDateString === undefined) {
        commentDate = dateToInteger(rightNow);
        commentTime = dateToTimeInteger(rightNow);
    }
    else {
        commentDate = dateStringToInteger(commentForm.commentDateString);
        commentTime = timeStringToInteger(commentForm.commentTimeString);
    }
    const database = sqlite(sunriseDB);
    const result = database
        .prepare(`insert into ContractComments (
        contractId,
        commentDate, commentTime,
        comment,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(commentForm.contractId, commentDate, commentTime ?? 0, commentForm.comment, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    database.close();
    return result.lastInsertRowid;
}
