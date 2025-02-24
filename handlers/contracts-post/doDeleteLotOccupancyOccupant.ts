import type { Request, Response } from 'express'

import deleteLotOccupancyOccupant from '../../database/deleteLotOccupancyOccupant.js'
import getLotOccupancyOccupants from '../../database/getLotOccupancyOccupants.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteLotOccupancyOccupant(
    request.body.burialSiteContractId,
    request.body.lotOccupantIndex,
    request.session.user as User
  )

  const lotOccupancyOccupants = await getLotOccupancyOccupants(
    request.body.burialSiteContractId
  )

  response.json({
    success,
    lotOccupancyOccupants
  })
}
