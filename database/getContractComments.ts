import { DatabaseSync } from 'node:sqlite'

import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractComment } from '../types/record.types.js'

export default function getContractComments(
  contractId: number | string,
  connectedDatabase?: DatabaseSync
): ContractComment[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  database.function('userFn_dateIntegerToString', (dateInteger: unknown) =>
    dateIntegerToString(dateInteger as number)
  )

  database.function('userFn_timeIntegerToString', (timeInteger: unknown) =>
    timeIntegerToString(timeInteger as number)
  )

  database.function(
    'userFn_timeIntegerToPeriodString',
    (timeInteger: unknown) => timeIntegerToPeriodString(timeInteger as number)
  )

  const comments = database
    .prepare(/* sql */ `
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
    .all(contractId) as unknown as ContractComment[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return comments
}
