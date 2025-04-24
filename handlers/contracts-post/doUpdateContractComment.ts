import type { Request, Response } from 'express'

import getContractComments from '../../database/getContractComments.js'
import updateContractComment, {
  type UpdateForm
} from '../../database/updateContractComment.js'

export default function handler(
  request: Request<unknown, unknown, UpdateForm & { contractId: string }>,
  response: Response
): void {
  const success = updateContractComment(
    request.body,
    request.session.user as User
  )

  const contractComments = getContractComments(request.body.contractId)

  response.json({
    success,

    contractComments
  })
}
