import type { Request, Response } from 'express'

import addContractComment, {
  type AddContractCommentForm
} from '../../database/addContractComment.js'
import getContractComments from '../../database/getContractComments.js'

export default function handler(
  request: Request<unknown, unknown, AddContractCommentForm>,
  response: Response
): void {
  addContractComment(request.body, request.session.user as User)

  const contractComments = getContractComments(
    request.body.contractId as string
  )

  response.json({
    success: true,

    contractComments
  })
}
