import type { Request, Response } from 'express'

import { deleteContract } from '../../database/deleteContract.js'

export type DoDeleteContractResponse =
  | {
      success: false

      errorMessage: string
    }
  | {
      success: true
    }

export default function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response<DoDeleteContractResponse>
): void {
  const success = deleteContract(
    request.body.contractId,
    request.session.user as User
  )

  if (!success) {
    response.status(400).json({
      success: false,

      errorMessage:
        'Note that contracts with active work orders cannot be deleted.'
    })
    return
  }

  response.json({
    success
  })
}
