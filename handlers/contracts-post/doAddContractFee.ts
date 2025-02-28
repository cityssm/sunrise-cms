import type { Request, Response } from 'express'

import addContractFee, {
  type AddContractFeeForm
} from '../../database/addContractFee.js'
import getContractFees from '../../database/getContractFees.js'

export default async function handler(
  request: Request<unknown, unknown, AddContractFeeForm>,
  response: Response
): Promise<void> {
  await addContractFee(request.body, request.session.user as User)

  const contractFees = await getContractFees(
    request.body.contractId as string
  )

  response.json({
    success: true,
    contractFees
  })
}
