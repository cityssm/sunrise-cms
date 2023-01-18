import type { Request, Response } from 'express'

import { addLot } from '../../helpers/lotOccupancyDB/addLot.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotId = await addLot(request.body, request.session)

  response.json({
    success: true,
    lotId
  })
}

export default handler
