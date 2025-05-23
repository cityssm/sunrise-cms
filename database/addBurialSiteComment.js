import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addBurialSiteComment(commentForm, user) {
    const database = sqlite(sunriseDB);
    const rightNow = new Date();
    const result = database
        .prepare(`insert into BurialSiteComments (
        burialSiteId,
        commentDate, commentTime, comment,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis) 
        values (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(commentForm.burialSiteId, dateToInteger(rightNow), dateToTimeInteger(rightNow), commentForm.comment, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    database.close();
    return result.lastInsertRowid;
}
