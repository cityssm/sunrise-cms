import type { Request, Response } from 'express'

import updateLotOccupancy, {
  type UpdateLotOccupancyForm
} from '../../database/updateLotOccupancy.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateLotOccupancy(
    request.body as UpdateLotOccupancyForm,
    request.session.user as User
  )

  response.json({
    success,
    lotOccupancyId: request.body.lotOccupancyId as string
  })
}
