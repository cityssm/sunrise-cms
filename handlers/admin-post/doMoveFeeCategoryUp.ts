import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'

import type { FeeCategory } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveFeeCategoryUpResponse =
  { success: boolean; feeCategories: FeeCategory[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { feeCategoryId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveFeeCategoryUpResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('FeeCategories', request.body.feeCategoryId)
      : moveRecordUp('FeeCategories', request.body.feeCategoryId)

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
