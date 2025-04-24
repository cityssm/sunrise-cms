import type { PoolConnection } from 'better-sqlite-pool'

import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'

import type { WorkOrderComment } from '../types/record.types.js'

import { acquireConnection } from './pool.js'

export default async function getWorkOrderComments(
  workOrderId: number | string,
  connectedDatabase?: PoolConnection
): Promise<WorkOrderComment[]> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)
  database.function(
    'userFn_timeIntegerToPeriodString',
    timeIntegerToPeriodString
  )

  const workOrderComments = database
    .prepare(
      `select workOrderCommentId,
        commentDate, userFn_dateIntegerToString(commentDate) as commentDateString,
        commentTime,
        userFn_timeIntegerToString(commentTime) as commentTimeString,
        userFn_timeIntegerToPeriodString(commentTime) as commentTimePeriodString,
        comment,
        recordCreate_userName, recordUpdate_userName
        from WorkOrderComments
        where recordDelete_timeMillis is null
        and workOrderId = ?
        order by commentDate desc, commentTime desc, workOrderCommentId desc`
    )
    .all(workOrderId) as WorkOrderComment[]

  if (connectedDatabase === undefined) {
    database.release()
  }

  return workOrderComments
}
