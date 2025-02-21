import type { Request, Response } from 'express'

import addLotOccupancyComment, {
  type AddLotOccupancyCommentForm
} from '../../database/addLotOccupancyComment.js'
import getLotOccupancyComments from '../../database/getLotOccupancyComments.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  await addLotOccupancyComment(
    request.body as AddLotOccupancyCommentForm,
    request.session.user as User
  )

  const lotOccupancyComments = await getLotOccupancyComments(
    request.body.lotOccupancyId as string
  )

  response.json({
    success: true,
    lotOccupancyComments
  })
}
