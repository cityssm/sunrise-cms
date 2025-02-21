import type { Request, Response } from 'express'

import addLotComment, {
  type AddLotCommentForm
} from '../../database/addLotComment.js'
import getLotComments from '../../database/getLotComments.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  await addLotComment(
    request.body as AddLotCommentForm,
    request.session.user as User
  )

  const lotComments = await getLotComments(request.body.lotId as string)

  response.json({
    success: true,
    lotComments
  })
}
