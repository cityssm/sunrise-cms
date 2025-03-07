import type { Request, Response } from 'express'

import addContractInterment, {
  type AddForm
} from '../../database/addContractInterment.js'
import getContractInterments from '../../database/getContractInterments.js'

export default async function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response
): Promise<void> {
  await addContractInterment(request.body, request.session.user as User)

  const contractInterments = await getContractInterments(
    request.body.contractId
  )

  response.json({
    success: true,
    contractInterments
  })
}
