import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function addContractComment(commentForm, user, connectedDatabase) {
    const rightNow = new Date();
    let commentDate;
    let commentTime;
    if (commentForm.commentDateString === undefined) {
        commentDate = dateToInteger(rightNow);
        commentTime = dateToTimeInteger(rightNow);
    }
    else {
        commentDate = dateStringToInteger(commentForm.commentDateString);
        commentTime = timeStringToInteger(commentForm.commentTimeString);
    }
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(/* sql */ `
      INSERT INTO
        ContractComments (
          contractId,
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
        .run(commentForm.contractId, commentDate, commentTime ?? 0, commentForm.comment, user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(/* sql */ `
        SELECT
          *
        FROM
          ContractComments
        WHERE
          contractCommentId = ?
      `)
            .get(result.lastInsertRowid);
        createAuditLogEntries({
            mainRecordId: commentForm.contractId,
            mainRecordType: 'contract',
            recordIndex: String(result.lastInsertRowid),
            updateTable: 'ContractComments'
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
