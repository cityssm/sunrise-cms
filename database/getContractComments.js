import { DatabaseSync } from 'node:sqlite';
import { dateIntegerToString, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractComments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    database.function('userFn_dateIntegerToString', {
        deterministic: true
    }, (dateInteger) => dateIntegerToString(dateInteger));
    database.function('userFn_timeIntegerToString', {
        deterministic: true
    }, (timeInteger) => timeIntegerToString(timeInteger));
    database.function('userFn_timeIntegerToPeriodString', {
        deterministic: true
    }, (timeInteger) => timeIntegerToPeriodString(timeInteger));
    const comments = database
        .prepare(`
      SELECT
        contractCommentId,
        commentDate,
        userFn_dateIntegerToString (commentDate) AS commentDateString,
        commentTime,
        userFn_timeIntegerToString (commentTime) AS commentTimeString,
        userFn_timeIntegerToPeriodString (commentTime) AS commentTimePeriodString,
        comment,
        recordCreate_username,
        recordUpdate_username
      FROM
        ContractComments
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
      ORDER BY
        commentDate DESC,
        commentTime DESC,
        contractCommentId DESC
    `)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return comments;
}
