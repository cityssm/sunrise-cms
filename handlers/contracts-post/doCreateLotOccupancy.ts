import type { Request, Response } from 'express'

import addLotOccupancy, {
  type AddLotOccupancyForm
} from '../../database/addLotOccupancy.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotOccupancyId = await addLotOccupancy(
    request.body as AddLotOccupancyForm,
    request.session.user as User
  )

  response.json({
    success: true,
    lotOccupancyId
  })
}

