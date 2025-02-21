import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import getLotOccupancy from '../../database/getLotOccupancy.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotOccupancyId = request.body.lotOccupancyId

  const lotOccupancy = (await getLotOccupancy(lotOccupancyId))!

  const feeCategories = await getFeeCategories(
    {
      occupancyTypeId: lotOccupancy.occupancyTypeId,
      lotTypeId: lotOccupancy.lotTypeId
    },
    {
      includeFees: true
    }
  )

  response.json({
    feeCategories
  })
}
