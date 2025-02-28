import type { Request, Response } from 'express'

import addContract, {
  type AddContractForm
} from '../../database/addContract.js'

export default async function handler(
  request: Request<unknown, unknown, AddContractForm>,
  response: Response
): Promise<void> {
  const contractId = await addContract(
    request.body,
    request.session.user as User
  )

  response.json({
    success: true,
    contractId
  })
}

