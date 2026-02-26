import type { Request, Response } from 'express'

import getContractFees from '../../database/getContractFees.js'
import updateContractFeeQuantity, {
  type UpdateBurialSiteFeeForm
} from '../../database/updateContractFeeQuantity.js'

import type { ContractFee } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateContractFeeQuantityResponse =
  { success: boolean; contractFees: ContractFee[] }

export default function handler(
  request: Request<unknown, unknown, UpdateBurialSiteFeeForm>,
  response: Response<DoUpdateContractFeeQuantityResponse>
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
