import type { Request, Response } from 'express'

import addBurialSiteComment, {
  type AddBurialSiteCommentForm
} from '../../database/addBurialSiteComment.js'
import getBurialSiteComments from '../../database/getBurialSiteComments.js'

export default async function handler(
  request: Request<unknown, unknown, AddBurialSiteCommentForm>,
  response: Response
): Promise<void> {
  await addBurialSiteComment(request.body, request.session.user as User)

  const burialSiteComments = await getBurialSiteComments(
    request.body.burialSiteId
  )

  response.json({
    success: true,

    burialSiteComments
  })
}
