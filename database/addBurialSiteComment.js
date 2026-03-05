import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addBurialSiteComment(commentForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNow = new Date();
    const result = database
        .prepare(/* sql */ `
      INSERT INTO
        BurialSiteComments (
          burialSiteId,
          commentDate,
          commentTime,
          comment,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(commentForm.burialSiteId, dateToInteger(rightNow), dateToTimeInteger(rightNow), commentForm.comment, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(
        /* sql */ `SELECT * FROM BurialSiteComments WHERE burialSiteCommentId = ?`)
            .get(result.lastInsertRowid);
        createAuditLogEntries({
            mainRecordType: 'burialSite',
            mainRecordId: commentForm.burialSiteId,
            updateTable: 'BurialSiteComments',
            recordIndex: String(result.lastInsertRowid)
        }, [
            {
                property: '*',
                type: 'created',
                from: undefined,
                to: recordAfter
            }
        ], user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.lastInsertRowid;
}
