import type { Request, Response } from 'express'

import getBurialSiteContractComments from '../../database/getBurialSiteContractComments.js'
import updateBurialSiteContractComment, {
  type UpdateForm
} from '../../database/updateBurialSiteContractComment.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    UpdateForm & { burialSiteContractId: string }
  >,
  response: Response
): Promise<void> {
  const success = await updateBurialSiteContractComment(
    request.body,
    request.session.user as User
  )

  const burialSiteContractComments = await getBurialSiteContractComments(
    request.body.burialSiteContractId
  )

  response.json({
    success,
    burialSiteContractComments
  })
}
