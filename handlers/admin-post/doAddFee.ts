import type { Request, Response } from 'express'

import addFee, { type AddFeeForm } from '../../database/addFee.js'
import getFeeCategories from '../../database/getFeeCategories.js'

export default function handler(request: Request, response: Response): void {
  const feeId = addFee(request.body as AddFeeForm, request.session.user as User)

  const feeCategories = getFeeCategories(
    {},
    {
      includeFees: true
    }
  )

  response.json({
    success: true,

    feeCategories,
    feeId
  })
}
