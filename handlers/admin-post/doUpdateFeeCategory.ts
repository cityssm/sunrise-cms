import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import updateFeeCategory, {
  type UpdateFeeCategoryForm
} from '../../database/updateFeeCategory.js'

export default function handler(request: Request, response: Response): void {
  const success = updateFeeCategory(
    request.body as UpdateFeeCategoryForm,
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
