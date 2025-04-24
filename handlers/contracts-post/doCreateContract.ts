import type { Request, Response } from 'express'

import addContract, {
  type AddContractForm
} from '../../database/addContract.js'

export default function handler(
  request: Request<unknown, unknown, AddContractForm>,
  response: Response
): void {
  const contractId = addContract(request.body, request.session.user as User)

  response.json({
    success: true,

    contractId
  })
}
