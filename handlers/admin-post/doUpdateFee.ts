import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import updateFee, { type UpdateFeeForm } from '../../database/updateFee.js'

export default function handler(request: Request, response: Response): void {
  const success = updateFee(
    request.body as UpdateFeeForm,
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
