import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface UpdateForm {
  contractCommentId: number | string
  commentDateString: DateString
  commentTimeString: TimeString
  comment: string
}

export default async function updateContractComment(
  commentForm: UpdateForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update ContractComments
        set commentDate = ?,
          commentTime = ?,
          comment = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractCommentId = ?`
    )
    .run(
      dateStringToInteger(commentForm.commentDateString),
      timeStringToInteger(commentForm.commentTimeString),
      commentForm.comment,
      user.userName,
      Date.now(),
      commentForm.contractCommentId
    )

  database.release()

  return result.changes > 0
}
