import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface AddWorkOrderCommentForm {
  workOrderId: string
  comment: string
}

export default async function addWorkOrderComment(
  workOrderCommentForm: AddWorkOrderCommentForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNow = new Date()

  const result = database
    .prepare(
      `insert into WorkOrderComments (
        workOrderId,
        commentDate, commentTime,
        comment,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      workOrderCommentForm.workOrderId,
      dateToInteger(rightNow),
      dateToTimeInteger(rightNow),
      workOrderCommentForm.comment,
      user.userName,
      rightNow.getTime(),
      user.userName,
      rightNow.getTime()
    )

  database.release()

  return result.lastInsertRowid as number
}
