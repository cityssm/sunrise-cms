import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getFeeCategories from '../../database/getFeeCategories.js'

export default function handler(
  request: Request<unknown, unknown, { feeCategoryId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'FeeCategories',
    request.body.feeCategoryId,
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
