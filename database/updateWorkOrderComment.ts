import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface UpdateWorkOrderCommentForm {
  workOrderCommentId: number | string

  comment: string
  commentDateString: DateString
  commentTimeString: TimeString
}

export default async function updateWorkOrderComment(
  commentForm: UpdateWorkOrderCommentForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update WorkOrderComments
        set commentDate = ?,
        commentTime = ?,
        comment = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and workOrderCommentId = ?`
    )
    .run(
      dateStringToInteger(commentForm.commentDateString),
      timeStringToInteger(commentForm.commentTimeString),
      commentForm.comment,
      user.userName,
      Date.now(),
      commentForm.workOrderCommentId
    )

  database.release()

  return result.changes > 0
}
