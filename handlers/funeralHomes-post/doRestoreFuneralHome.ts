import type { Request, Response } from 'express'

import { restoreFuneralHome } from '../../database/restoreFuneralHome.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoRestoreFuneralHomeResponse = {
  success: boolean

  funeralHomeId: number
}

export default function handler(
  request: Request<unknown, unknown, { funeralHomeId: number }>,
  response: Response<DoRestoreFuneralHomeResponse>
): void {
  const success = restoreFuneralHome(
    request.body.funeralHomeId,
    request.session.user as User
  )

  const funeralHomeId =
    typeof request.body.funeralHomeId === 'string'
      ? Number.parseInt(request.body.funeralHomeId, 10)
      : request.body.funeralHomeId

  response.json({
    success,

    funeralHomeId
  })
}
