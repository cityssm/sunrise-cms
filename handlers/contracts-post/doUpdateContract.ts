import type { Request, Response } from 'express'

import updateContract, {
  type UpdateContractForm
} from '../../database/updateContract.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateContractForm>,
  response: Response
): Promise<void> {
  const success = await updateContract(
    request.body,
    request.session.user as User
  )

  response.json({
    success,
    contractId: request.body.contractId
  })
}
