import type { Request, Response } from 'express'

import deleteLotOccupancyFee from '../../database/deleteLotOccupancyFee.js'
import getLotOccupancyFees from '../../database/getLotOccupancyFees.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteLotOccupancyFee(
    request.body.burialSiteContractId,
    request.body.feeId,
    request.session.user as User
  )

  const lotOccupancyFees = await getLotOccupancyFees(
    request.body.burialSiteContractId
  )

  response.json({
    success,
    lotOccupancyFees
  })
}
