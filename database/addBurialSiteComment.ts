import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface AddBurialSiteCommentForm {
  burialSiteId: string
  comment: string
}

export default async function addBurialSiteComment(
  commentForm: AddBurialSiteCommentForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNow = new Date()

  const result = database
    .prepare(
      `insert into BurialSiteComments (
        burialSiteId,
        commentDate, commentTime, comment,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis) 
        values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      commentForm.burialSiteId,
      dateToInteger(rightNow),
      dateToTimeInteger(rightNow),
      commentForm.comment,
      user.userName,
      rightNow.getTime(),
      user.userName,
      rightNow.getTime()
    )

  database.release()

  return result.lastInsertRowid as number
}
