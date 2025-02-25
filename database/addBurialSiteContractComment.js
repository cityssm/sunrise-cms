import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function addBurialSiteContractComment(commentForm, user) {
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
    const database = await acquireConnection();
    const result = database
        .prepare(`insert into BurialSiteContactComments (
        burialSiteContractId,
        commentDate, commentTime,
        comment,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(commentForm.burialSiteContractId, commentDate, commentTime ?? 0, commentForm.comment, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    database.release();
    return result.lastInsertRowid;
}
