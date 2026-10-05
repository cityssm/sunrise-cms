import { type SQLOutputValue, DatabaseSync } from 'node:sqlite'

import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { WorkOrderComment } from '../types/record.types.js'

export default function getWorkOrderComments(
  workOrderId: number | string,
  connectedDatabase?: DatabaseSync
): WorkOrderComment[] {
  const database =
    connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true })

  database.function(
    'userFn_dateIntegerToString',
    {
      deterministic: true
    },
    (dateInteger: SQLOutputValue) => dateIntegerToString(dateInteger as number)
  )

  database.function(
    'userFn_timeIntegerToString',
    {
      deterministic: true
    },
    (timeInteger: SQLOutputValue) => timeIntegerToString(timeInteger as number)
  )

  database.function(
    'userFn_timeIntegerToPeriodString',
    {
      deterministic: true
    },
    (timeInteger: SQLOutputValue) =>
      timeIntegerToPeriodString(timeInteger as number)
  )

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
        recordCreate_username,
        recordUpdate_username
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
    .all(workOrderId) as WorkOrderComment[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return workOrderComments
}
