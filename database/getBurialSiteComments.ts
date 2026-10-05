import { type SQLOutputValue, DatabaseSync } from 'node:sqlite'

import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSiteComment } from '../types/record.types.js'

export default function getBurialSiteComments(
  burialSiteId: number | string,
  connectedDatabase?: DatabaseSync
): BurialSiteComment[] {
  const database =
    connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true })

  database.function(
    'userFn_dateIntegerToString',
    {
      deterministic: true
    },
    (dateInteger: SQLOutputValue): string =>
      dateIntegerToString(dateInteger as number)
  )

  database.function(
    'userFn_timeIntegerToString',
    {
      deterministic: true
    },
    (timeInteger: SQLOutputValue): string =>
      timeIntegerToString(timeInteger as number)
  )

  database.function(
    'userFn_timeIntegerToPeriodString',
    {
      deterministic: true
    },
    (timeInteger: SQLOutputValue): string =>
      timeIntegerToPeriodString(timeInteger as number)
  )

  const comments = database
    .prepare(/* sql */ `
      SELECT
        burialSiteCommentId,
        commentDate,
        userFn_dateIntegerToString (commentDate) AS commentDateString,
        commentTime,
        userFn_timeIntegerToString (commentTime) AS commentTimeString,
        userFn_timeIntegerToPeriodString (commentTime) AS commentTimePeriodString,
        comment,
        recordCreate_username,
        recordUpdate_username
      FROM
        BurialSiteComments
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteId = ?
      ORDER BY
        commentDate DESC,
        commentTime DESC,
        burialSiteCommentId DESC
    `)
    .all(burialSiteId) as BurialSiteComment[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return comments
}
