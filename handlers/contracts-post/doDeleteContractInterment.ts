import type { Request, Response } from 'express'

import deleteContractInterment from '../../database/deleteContractInterment.js'
import getContractInterments from '../../database/getContractInterments.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; intermentNumber: string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteContractInterment(
    request.body.contractId,
    request.body.intermentNumber,
    request.session.user as User
  )

  const contractInterments = await getContractInterments(
    request.body.contractId
  )

  response.json({
    success,
    contractInterments
  })
}
