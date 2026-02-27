import type { Request, Response } from 'express'

import getFuneralDirectorNamesByFuneralHomeId from '../../database/getFuneralDirectorNamesByFuneralHomeId.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetFuneralDirectorsResponse = {
  success: true

  funeralDirectorNames: string[]
}

export default function handler(
  request: Request<unknown, unknown, { funeralHomeId: string }>,
  response: Response<DoGetFuneralDirectorsResponse>
): void {
  const funeralHomeId = request.body.funeralHomeId

  const funeralDirectorNames =
    getFuneralDirectorNamesByFuneralHomeId(funeralHomeId)

  response.json({
    success: true,

    funeralDirectorNames
  })
}
