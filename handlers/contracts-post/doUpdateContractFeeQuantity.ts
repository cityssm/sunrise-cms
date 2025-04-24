import type { Request, Response } from 'express'

import getContractFees from '../../database/getContractFees.js'
import updateContractFeeQuantity, {
  type UpdateBurialSiteFeeForm
} from '../../database/updateContractFeeQuantity.js'

export default function handler(
  request: Request<unknown, unknown, UpdateBurialSiteFeeForm>,
  response: Response
): void {
  const success = updateContractFeeQuantity(
    request.body,
    request.session.user as User
  )

  const contractFees = getContractFees(request.body.contractId)

  response.json({
    success,

    contractFees
  })
}
