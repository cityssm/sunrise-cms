import type { Request, Response } from 'express'

import getContractInterments from '../../database/getContractInterments.js'
import updateContractInterment, {
  type UpdateForm
} from '../../database/updateContractInterment.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response
): Promise<void> {
  await updateContractInterment(
    request.body,
    request.session.user as User
  )

  const contractInterments =
    await getContractInterments(request.body.contractId)

  response.json({
    success: true,
    contractInterments
  })
}
