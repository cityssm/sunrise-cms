import type { Request, Response } from 'express'

import getFuneralDirectorNamesByFuneralHomeId from '../../database/getFuneralDirectorNamesByFuneralHomeId.js'

export default function handler(
  request: Request<unknown, unknown, { funeralHomeId: string }>,
  response: Response
): void {
  const funeralHomeId = request.body.funeralHomeId

  const funeralDirectorNames =
    getFuneralDirectorNamesByFuneralHomeId(funeralHomeId)

  response.json({
    success: true,

    funeralDirectorNames
  })
}
