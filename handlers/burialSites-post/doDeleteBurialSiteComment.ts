import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getBurialSiteComments from '../../database/getBurialSiteComments.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteCommentId: string; burialSiteId: string; }
  >,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'BurialSiteComments',
    request.body.burialSiteCommentId,
    request.session.user as User
  )

  const burialSiteComments = await getBurialSiteComments(
    request.body.burialSiteId as string
  )

  response.json({
    success,
    
    burialSiteComments
  })
}
