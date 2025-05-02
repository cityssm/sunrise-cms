import type { Request, Response } from 'express'

import { restoreFuneralHome } from '../../database/restoreFuneralHome.js'

export default function handler(
  request: Request<unknown, unknown, { funeralHomeId: number }>,
  response: Response
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
