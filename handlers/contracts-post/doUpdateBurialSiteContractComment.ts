import type { Request, Response } from 'express'

import getBurialSiteContractComments from '../../database/getBurialSiteContractComments.js'
import updateLotOccupancyComment, {
  type UpdateLotOccupancyCommentForm
} from '../../database/updateLotOccupancyComment.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateLotOccupancyComment(
    request.body as UpdateLotOccupancyCommentForm,
    request.session.user as User
  )

  const burialSiteContractComments = await getBurialSiteContractComments(
    request.body.burialSiteContractId as string
  )

  response.json({
    success,
    burialSiteContractComments
  })
}
