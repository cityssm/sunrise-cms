import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface BurialSiteCommentUpdateForm {
  burialSiteContractCommentId: string | number
  commentDateString: DateString
  commentTimeString: TimeString
  comment: string
}

export default async function updateBurialSiteContractComment(
  commentForm: BurialSiteCommentUpdateForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update BurialSiteContractComments
        set commentDate = ?,
          commentTime = ?,
          comment = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and burialSiteContractCommentId = ?`
    )
    .run(
      dateStringToInteger(commentForm.commentDateString),
      timeStringToInteger(commentForm.commentTimeString),
      commentForm.comment,
      user.userName,
      Date.now(),
      commentForm.burialSiteContractCommentId
    )

  database.release()

  return result.changes > 0
}
