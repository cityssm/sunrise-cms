import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getContractComments from '../../database/getContractComments.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractCommentId: string; contractId: string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'ContractComments',
    request.body.contractCommentId,
    request.session.user as User
  )

  const contractComments = await getContractComments(
    request.body.contractId
  )

  response.json({
    success,
    contractComments
  })
}
