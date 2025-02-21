import type { Request, Response } from 'express'

import getLotComments from '../../database/getLotComments.js'
import updateLotComment, {
  type UpdateLotCommentForm
} from '../../database/updateLotComment.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateLotComment(
    request.body as UpdateLotCommentForm,
    request.session.user as User
  )

  const lotComments = await getLotComments(request.body.lotId as string)

  response.json({
    success,
    lotComments
  })
}
