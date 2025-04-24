import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractComment(commentForm, user) {
    const database = sqlite(sunriseDB);
    const result = database
        .prepare(`update ContractComments
        set commentDate = ?,
          commentTime = ?,
          comment = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractCommentId = ?`)
        .run(dateStringToInteger(commentForm.commentDateString), timeStringToInteger(commentForm.commentTimeString), commentForm.comment, user.userName, Date.now(), commentForm.contractCommentId);
    database.close();
    return result.changes > 0;
}
