import type { Request, Response } from 'express'

import deleteContractInterment from '../../database/deleteContractInterment.js'
import getContractInterments from '../../database/getContractInterments.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; intermentNumber: string }
  >,
  response: Response
): void {
  const success = deleteContractInterment(
    request.body.contractId,
    request.body.intermentNumber,
    request.session.user as User
  )

  const contractInterments = getContractInterments(request.body.contractId)

  response.json({
    success,

    contractInterments
  })
}
