import type { Request, Response } from 'express'

import { deleteContract } from '../../database/deleteContract.js'

export default function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response
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
