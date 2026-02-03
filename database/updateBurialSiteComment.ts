import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateBurialSiteCommentForm {
  burialSiteCommentId: number | string
  comment: string
  commentDateString: DateString
  commentTimeString: TimeString
}

export default function updateBurialSiteComment(
  commentForm: UpdateBurialSiteCommentForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(/* sql */ `update BurialSiteComments
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

  if (connectedDatabase === undefined) {
    database.close()
  }
  
  return result.changes > 0
}
