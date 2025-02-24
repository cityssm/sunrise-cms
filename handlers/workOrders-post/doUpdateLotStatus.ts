import type { Request, Response } from 'express'

import getLots from '../../database/getLots.js'
import { updateLotStatus } from '../../database/updateLot.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateLotStatus(
    request.body.lotId as string,
    request.body.burialSiteStatusId as string,
    request.session.user as User
  )

  const workOrderLotsResults = await getLots(
    {
      workOrderId: request.body.workOrderId as string
    },
    {
      limit: -1,
      offset: 0,
      includeLotOccupancyCount: true
    }
  )

  response.json({
    success,
    workOrderLots: workOrderLotsResults.lots
  })
}
