import type { Request, Response } from 'express'

import addContract, {
  type AddContractForm
} from '../../database/addContract.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCreateContractResponse =
  { success: true; contractId: number }

export default function handler(
  request: Request<unknown, unknown, AddContractForm>,
  response: Response<DoCreateContractResponse>
): void {
  const contractId = addContract(request.body, request.session.user as User)

  response.json({
    success: true,

    contractId
  })
}
