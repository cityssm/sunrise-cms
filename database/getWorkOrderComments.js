import { dateIntegerToString, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getWorkOrderComments(workOrderId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    database.function('userFn_timeIntegerToPeriodString', timeIntegerToPeriodString);
    const workOrderComments = database
        .prepare(/* sql */ `
      SELECT
        workOrderCommentId,
        commentDate,
        userFn_dateIntegerToString (commentDate) AS commentDateString,
        commentTime,
        userFn_timeIntegerToString (commentTime) AS commentTimeString,
        userFn_timeIntegerToPeriodString (commentTime) AS commentTimePeriodString,
        comment,
        recordCreate_userName,
        recordUpdate_userName
      FROM
        WorkOrderComments
      WHERE
        recordDelete_timeMillis IS NULL
        AND workOrderId = ?
      ORDER BY
        commentDate DESC,
        commentTime DESC,
        workOrderCommentId DESC
    `)
        .all(workOrderId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return workOrderComments;
}
