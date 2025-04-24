import type { Request, Response } from 'express'

import getContractInterments from '../../database/getContractInterments.js'
import updateContractInterment, {
  type UpdateForm
} from '../../database/updateContractInterment.js'

export default function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response
): void {
  updateContractInterment(request.body, request.session.user as User)

  const contractInterments = getContractInterments(request.body.contractId)

  response.json({
    success: true,

    contractInterments
  })
}
