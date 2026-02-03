import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddContractCommentForm {
  contractId: number | string

  comment: string
  commentDateString?: DateString
  commentTimeString?: TimeString
}

export default function addContractComment(
  commentForm: AddContractCommentForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const rightNow = new Date()

  let commentDate = 0
  let commentTime: number | undefined = 0

  if (commentForm.commentDateString === undefined) {
    commentDate = dateToInteger(rightNow)
    commentTime = dateToTimeInteger(rightNow)
  } else {
    commentDate = dateStringToInteger(
      commentForm.commentDateString
    )
    commentTime = timeStringToInteger(
      commentForm.commentTimeString as TimeString
    )
  }

  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(/* sql */ `insert into ContractComments (
        contractId,
        commentDate, commentTime,
        comment,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      commentForm.contractId,
      commentDate,
      commentTime ?? 0,
      commentForm.comment,
      user.userName,
      rightNow.getTime(),
      user.userName,
      rightNow.getTime()
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.lastInsertRowid as number
}
