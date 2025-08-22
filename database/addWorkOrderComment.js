import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addWorkOrderComment(workOrderCommentForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNow = new Date();
    const result = database
        .prepare(`insert into WorkOrderComments (
        workOrderId,
        commentDate, commentTime,
        comment,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(workOrderCommentForm.workOrderId, dateToInteger(rightNow), dateToTimeInteger(rightNow), workOrderCommentForm.comment, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.lastInsertRowid;
}
