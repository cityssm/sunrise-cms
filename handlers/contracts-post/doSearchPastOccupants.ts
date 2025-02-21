import type { Request, Response } from 'express'

import getPastLotOccupancyOccupants, {
  type GetPastLotOccupancyOccupantsFilters
} from '../../database/getPastLotOccupancyOccupants.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const occupants = await getPastLotOccupancyOccupants(
    request.body as GetPastLotOccupancyOccupantsFilters,
    {
      limit: Number.parseInt(request.body.limit as string, 10)
    }
  )

  response.json({
    occupants
  })
}
