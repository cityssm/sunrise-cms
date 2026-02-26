import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import { moveFeeDown, moveFeeDownToBottom } from '../../database/moveFee.js'

import type { FeeCategory } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveFeeDownResponse =
  { success: boolean; feeCategories: FeeCategory[] }

export default function handler(
  request: Request<unknown, unknown, { feeId: string; moveToEnd: '0' | '1' }>,
  response: Response<DoMoveFeeDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveFeeDownToBottom(request.body.feeId)
      : moveFeeDown(request.body.feeId)

  const feeCategories = getFeeCategories(
    {},
    {
      includeFees: true
    }
  )

  response.json({
    success,

    feeCategories
  })
}
