import type { Request, Response } from 'express'

import addLotOccupancyFeeCategory, {
  type AddLotOccupancyFeeCategoryForm
} from '../../database/addLotOccupancyFeeCategory.js'
import getLotOccupancyFees from '../../database/getLotOccupancyFees.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  await addLotOccupancyFeeCategory(
    request.body as AddLotOccupancyFeeCategoryForm,
    request.session.user as User
  )

  const lotOccupancyFees = await getLotOccupancyFees(
    request.body.lotOccupancyId as string
  )

  response.json({
    success: true,
    lotOccupancyFees
  })
}
