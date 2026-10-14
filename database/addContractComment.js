import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import { isAuditLoggingEnabled } from '../helpers/config.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
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
    const database = connectedDatabase ?? getDatabaseConnection();
    const result = database
        .prepare(`
      INSERT INTO
        ContractComments (
          contractId,
          commentDate,
          commentTime,
          comment,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(commentForm.contractId, commentDate, commentTime ?? 0, commentForm.comment, user.username, rightNow.getTime(), user.username, rightNow.getTime());
    if (isAuditLoggingEnabled) {
        const recordAfter = database
            .prepare(`
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
