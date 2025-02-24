import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function updateBurialSiteComment(commentForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update BurialSiteComments
        set commentDate = ?,
        commentTime = ?,
        comment = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and burialSiteCommentId = ?`)
        .run(dateStringToInteger(commentForm.commentDateString), timeStringToInteger(commentForm.commentTimeString), commentForm.comment, user.userName, Date.now(), commentForm.burialSiteCommentId);
    database.release();
    return result.changes > 0;
}
