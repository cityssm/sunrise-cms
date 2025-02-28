import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import type { ContractComment } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getContractComments(
  contractId: number | string,
  connectedDatabase?: PoolConnection
): Promise<ContractComment[]> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)
  database.function(
    'userFn_timeIntegerToPeriodString',
    timeIntegerToPeriodString
  )

  const comments = database
    .prepare(
      `select contractCommentId,
        commentDate, userFn_dateIntegerToString(commentDate) as commentDateString,
        commentTime,
        userFn_timeIntegerToString(commentTime) as commentTimeString,
        userFn_timeIntegerToPeriodString(commentTime) as commentTimePeriodString,
        comment,
        recordCreate_userName, recordUpdate_userName
        from ContractComments
        where recordDelete_timeMillis is null
        and contractId = ?
        order by commentDate desc, commentTime desc, contractCommentId desc`
    )
    .all(contractId) as ContractComment[]

  if (connectedDatabase === undefined) {
    database.release()
  }

  return comments
}
