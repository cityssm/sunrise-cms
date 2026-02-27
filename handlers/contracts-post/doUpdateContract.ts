import type { Request, Response } from 'express'

import updateContract, {
  type UpdateContractForm
} from '../../database/updateContract.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateContractResponse = {
  success: boolean

  contractId: number | string
}

export default function handler(
  request: Request<unknown, unknown, UpdateContractForm>,
  response: Response<DoUpdateContractResponse>
): void {
  const success = updateContract(request.body, request.session.user as User)

  response.json({
    success,

    contractId: request.body.contractId
  })
}
