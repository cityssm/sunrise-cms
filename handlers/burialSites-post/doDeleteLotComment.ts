import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getLotComments from '../../database/getLotComments.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'LotComments',
    request.body.lotCommentId as string,
    request.session.user as User
  )

  const lotComments = await getLotComments(request.body.lotId as string)

  response.json({
    success,
    lotComments
  })
}
