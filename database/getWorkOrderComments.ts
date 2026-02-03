import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { WorkOrderComment } from '../types/record.types.js'

export default function getWorkOrderComments(
  workOrderId: number | string,
  connectedDatabase?: sqlite.Database
): WorkOrderComment[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)
  database.function(
    'userFn_timeIntegerToPeriodString',
    timeIntegerToPeriodString
  )

  const workOrderComments = database
    .prepare(/* sql */ `select workOrderCommentId,
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
    database.close()
  }

  return workOrderComments
}
