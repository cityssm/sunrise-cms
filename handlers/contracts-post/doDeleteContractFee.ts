import type { Request, Response } from 'express'

import deleteContractFee from '../../database/deleteContractFee.js'
import getContractFees from '../../database/getContractFees.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; feeId: string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteContractFee(
    request.body.contractId,
    request.body.feeId,
    request.session.user as User
  )

  const contractFees = await getContractFees(
    request.body.contractId
  )

  response.json({
    success,
    contractFees
  })
}
