import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import type { BurialSiteContractComment } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getBurialSiteContractComments(
  burialSiteContractId: number | string,
  connectedDatabase?: PoolConnection
): Promise<BurialSiteContractComment[]> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)
  database.function(
    'userFn_timeIntegerToPeriodString',
    timeIntegerToPeriodString
  )

  const comments = database
    .prepare(
      `select burialSiteContractCommentId,
        commentDate, userFn_dateIntegerToString(commentDate) as commentDateString,
        commentTime,
        userFn_timeIntegerToString(commentTime) as commentTimeString,
        userFn_timeIntegerToPeriodString(commentTime) as commentTimePeriodString,
        comment,
        recordCreate_userName, recordUpdate_userName
        from BurialSiteContractComments
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
        order by commentDate desc, commentTime desc, burialSiteContractCommentId desc`
    )
    .all(burialSiteContractId) as BurialSiteContractComment[]

  if (connectedDatabase === undefined) {
    database.release()
  }

  return comments
}
