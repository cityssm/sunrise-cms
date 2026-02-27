import type { Request, Response } from 'express'

import getContractFees from '../../database/getContractFees.js'
import updateContractFeeQuantity, {
  type UpdateBurialSiteFeeForm
} from '../../database/updateContractFeeQuantity.js'
import type { ContractFee } from '../../types/record.types.js'

export type DoUpdateContractFeeQuantityResponse =
  | {
      success: false

      errorMessage: string
    }
  | {
      success: true

      contractFees: ContractFee[]
    }

export default function handler(
  request: Request<unknown, unknown, UpdateBurialSiteFeeForm>,
  response: Response<DoUpdateContractFeeQuantityResponse>
): void {
  const success = updateContractFeeQuantity(
    request.body,
    request.session.user as User
  )

  if (!success) {
    response.status(400).json({
      success: false,

      errorMessage: 'Failed to update fee quantity'
    })
    return
  }

  const contractFees = getContractFees(request.body.contractId)

  response.json({
    success,

    contractFees
  })
}
