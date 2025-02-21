import type { Request, Response } from 'express'

import getLotOccupancyOccupants from '../../database/getLotOccupancyOccupants.js'
import updateLotOccupancyOccupant, {
  type UpdateLotOccupancyOccupantForm
} from '../../database/updateLotOccupancyOccupant.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateLotOccupancyOccupant(
    request.body as UpdateLotOccupancyOccupantForm,
    request.session.user as User
  )

  const lotOccupancyOccupants = await getLotOccupancyOccupants(
    request.body.lotOccupancyId as string
  )

  response.json({
    success,
    lotOccupancyOccupants
  })
}
