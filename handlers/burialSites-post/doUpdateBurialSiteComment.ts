import type { Request, Response } from 'express'

import getBurialSiteComments from '../../database/getBurialSiteComments.js'
import updateBurialSiteComment, {
  type UpdateBurialSiteCommentForm
} from '../../database/updateBurialSiteComment.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    UpdateBurialSiteCommentForm & { burialSiteId: string }
  >,
  response: Response
): void {
  const success = updateBurialSiteComment(
    request.body,
    request.session.user as User
  )

  const burialSiteComments = getBurialSiteComments(request.body.burialSiteId)

  response.json({
    success,

    burialSiteComments
  })
}
