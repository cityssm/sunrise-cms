import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getFeeCategories from '../../database/getFeeCategories.js'

export default async function handler(
  request: Request<unknown, unknown, { feeCategoryId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'FeeCategories',
    request.body.feeCategoryId,
    request.session.user as User
  )

  const feeCategories = await getFeeCategories(
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
