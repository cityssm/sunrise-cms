import type { Request, Response } from 'express'

import copyContract from '../../database/copyContract.js'

export default async function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response
): Promise<void> {
  const contractId = await copyContract(
    request.body.contractId,
    request.session.user as User
  )

  response.json({
    success: true,

    contractId
  })
}
