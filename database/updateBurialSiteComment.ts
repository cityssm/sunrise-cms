import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface UpdateBurialSiteCommentForm {
  burialSiteCommentId: number | string
  comment: string
  commentDateString: DateString
  commentTimeString: TimeString
}

export default async function updateBurialSiteComment(
  commentForm: UpdateBurialSiteCommentForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update BurialSiteComments
        set commentDate = ?,
        commentTime = ?,
        comment = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and burialSiteCommentId = ?`
    )
    .run(
      dateStringToInteger(commentForm.commentDateString),
      timeStringToInteger(commentForm.commentTimeString),
      commentForm.comment,
      user.userName,
      Date.now(),
      commentForm.burialSiteCommentId
    )

  database.release()

  return result.changes > 0
}
