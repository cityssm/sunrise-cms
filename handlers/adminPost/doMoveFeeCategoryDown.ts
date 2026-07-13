import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import type { FeeCategory } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveFeeCategoryDownResponse = {
  success: boolean

  feeCategories: FeeCategory[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { feeCategoryId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveFeeCategoryDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('FeeCategories', request.body.feeCategoryId)
      : moveRecordDown('FeeCategories', request.body.feeCategoryId)

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
