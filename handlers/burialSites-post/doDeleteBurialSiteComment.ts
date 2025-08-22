import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getBurialSiteComments from '../../database/getBurialSiteComments.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteCommentId: string; burialSiteId: string }
  >,
  response: Response
): void {
  const success = deleteRecord(
    'BurialSiteComments',
    request.body.burialSiteCommentId,
    request.session.user as User
  )

  const burialSiteComments = getBurialSiteComments(
    request.body.burialSiteId
  )

  response.json({
    success,

    burialSiteComments
  })
}
