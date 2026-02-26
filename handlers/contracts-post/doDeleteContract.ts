import type { Request, Response } from 'express'

import { deleteContract } from '../../database/deleteContract.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteContractResponse =
  { success: boolean; errorMessage: string }

export default function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response<DoDeleteContractResponse>
): void {
  const success = deleteContract(
    request.body.contractId,
    request.session.user as User
  )

  response.json({
    success,

    errorMessage: success
      ? ''
      : 'Note that contracts with active work orders cannot be deleted.'
  })
}
