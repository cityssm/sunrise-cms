import type { Request, Response } from 'express'

import addLotOccupancyOccupant, {
  type AddLotOccupancyOccupantForm
} from '../../database/addLotOccupancyOccupant.js'
import getLotOccupancyOccupants from '../../database/getLotOccupancyOccupants.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  await addLotOccupancyOccupant(
    request.body as AddLotOccupancyOccupantForm,
    request.session.user as User
  )

  const lotOccupancyOccupants = await getLotOccupancyOccupants(
    request.body.lotOccupancyId
  )

  response.json({
    success: true,
    lotOccupancyOccupants
  })
}
