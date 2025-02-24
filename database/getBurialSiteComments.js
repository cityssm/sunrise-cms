import { dateIntegerToString, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function getBurialSiteComments(burialSiteId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    database.function('userFn_timeIntegerToPeriodString', timeIntegerToPeriodString);
    const comments = database
        .prepare(`select burialSiteCommentId,
        commentDate, userFn_dateIntegerToString(commentDate) as commentDateString,
        commentTime,
        userFn_timeIntegerToString(commentTime) as commentTimeString,
        userFn_timeIntegerToPeriodString(commentTime) as commentTimePeriodString,
        comment,
        recordCreate_userName, recordUpdate_userName
        from BurialSiteComments
        where recordDelete_timeMillis is null
        and burialSiteId = ?
        order by commentDate desc, commentTime desc, burialSiteCommentId desc`)
        .all(burialSiteId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return comments;
}
