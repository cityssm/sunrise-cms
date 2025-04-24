import type { Request, Response } from 'express'

import addContractInterment, {
  type AddForm
} from '../../database/addContractInterment.js'
import getContractInterments from '../../database/getContractInterments.js'

export default function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response
): void {
  addContractInterment(request.body, request.session.user as User)

  const contractInterments = getContractInterments(request.body.contractId)

  response.json({
    success: true,

    contractInterments
  })
}
