import type { Request, Response } from 'express'

import addLotOccupancyFee, {
  type AddLotOccupancyFeeForm
} from '../../database/addLotOccupancyFee.js'
import getLotOccupancyFees from '../../database/getLotOccupancyFees.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  await addLotOccupancyFee(
    request.body as AddLotOccupancyFeeForm,
    request.session.user as User
  )

  const lotOccupancyFees = await getLotOccupancyFees(
    request.body.burialSiteContractId as string
  )

  response.json({
    success: true,
    lotOccupancyFees
  })
}
