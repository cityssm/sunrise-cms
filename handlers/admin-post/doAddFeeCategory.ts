import type { Request, Response } from 'express'

import addFeeCategory, {
  type AddFeeCategoryForm
} from '../../database/addFeeCategory.js'
import getFeeCategories from '../../database/getFeeCategories.js'

export default function handler(request: Request, response: Response): void {
  const feeCategoryId = addFeeCategory(
    request.body as AddFeeCategoryForm,
    request.session.user as User
  )

  const feeCategories = getFeeCategories(
    {},
    {
      includeFees: true
    }
  )

  response.json({
    success: true,

    feeCategories,
    feeCategoryId
  })
}
