import type { Request, Response } from 'express'

import addBurialSiteContractComment, {
  type AddBurialSiteContractCommentForm
} from '../../database/addBurialSiteContractComment.js'
import getBurialSiteContractComments from '../../database/getBurialSiteContractComments.js'

export default async function handler(
  request: Request<unknown, unknown, AddBurialSiteContractCommentForm>,
  response: Response
): Promise<void> {
  await addBurialSiteContractComment(request.body, request.session.user as User)

  const burialSiteContractComments = await getBurialSiteContractComments(
    request.body.burialSiteContractId as string
  )

  response.json({
    success: true,
    burialSiteContractComments
  })
}
