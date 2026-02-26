import type { Request, Response } from 'express'

import copyContract from '../../database/copyContract.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCopyContractResponse =
  { success: true; contractId: number }

export default async function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response<DoCopyContractResponse>
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
