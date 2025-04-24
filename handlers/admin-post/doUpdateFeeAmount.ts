import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import {
  type UpdateFeeAmountForm,
  updateFeeAmount
} from '../../database/updateFee.js'

export default function handler(request: Request, response: Response): void {
  const success = updateFeeAmount(
    request.body as UpdateFeeAmountForm,
    request.session.user as User
  )

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
