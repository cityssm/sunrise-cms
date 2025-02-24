import type { Request, Response } from 'express'

import getLotOccupancyFees from '../../database/getLotOccupancyFees.js'
import updateLotOccupancyFeeQuantity, {
  type UpdateLotOccupancyFeeQuantityForm
} from '../../database/updateLotOccupancyFeeQuantity.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateLotOccupancyFeeQuantity(
    request.body as UpdateLotOccupancyFeeQuantityForm,
    request.session.user as User
  )

  const lotOccupancyFees = await getLotOccupancyFees(
    request.body.burialSiteContractId as string
  )

  response.json({
    success,
    lotOccupancyFees
  })
}
