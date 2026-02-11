import type { Request, Response } from 'express'

import updateContract, {
  type UpdateContractForm
} from '../../database/updateContract.js'

export default function handler(
  request: Request<unknown, unknown, UpdateContractForm>,
  response: Response
): void {
  const success = updateContract(request.body, request.session.user as User)

  response.json({
    success,

    contractId: request.body.contractId
  })
}
