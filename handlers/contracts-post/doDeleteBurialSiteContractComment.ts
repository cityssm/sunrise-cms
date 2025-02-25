import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getBurialSiteContractComments from '../../database/getBurialSiteContractComments.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteContractCommentId: string; burialSiteContractId: string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'BurialSiteContractComments',
    request.body.burialSiteContractCommentId,
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
