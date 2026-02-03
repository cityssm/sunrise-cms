import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractComment } from '../types/record.types.js'

export default function getContractComments(
  contractId: number | string,
  connectedDatabase?: sqlite.Database
): ContractComment[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)
  database.function(
    'userFn_timeIntegerToPeriodString',
    timeIntegerToPeriodString
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
        recordCreate_userName,
        recordUpdate_userName
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
    .all(contractId) as ContractComment[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return comments
}
