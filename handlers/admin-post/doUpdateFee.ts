import type { Request, Response } from 'express'

import { updateFee } from '../../helpers/lotOccupancyDB/updateFee.js'

import { getFeeCategories } from '../../helpers/lotOccupancyDB/getFeeCategories.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateFee(request.body, request.session)

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

export default handler
