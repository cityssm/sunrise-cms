import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateBurialSiteComment(commentForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
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
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
