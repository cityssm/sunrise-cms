import type { Request, Response } from 'express'

import getContractFees from '../../database/getContractFees.js'
import updateContractFeeQuantity, {
  type UpdateBurialSiteFeeForm
} from '../../database/updateContractFeeQuantity.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateBurialSiteFeeForm>,
  response: Response
): Promise<void> {
  const success = await updateContractFeeQuantity(
    request.body,
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
