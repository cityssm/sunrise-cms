import type { Request, Response } from 'express'

import { restoreFuneralHome } from '../../database/restoreFuneralHome.js'

export type DoRestoreFuneralHomeResponse =
  | { errorMessage: string; success: false }
  | {
      success: true

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

  if (!success) {
    response.status(400).json({
      errorMessage: 'Failed to restore funeral home',
      success: false
    })
    return
  }

  const funeralHomeId =
    typeof request.body.funeralHomeId === 'string'
      ? Number.parseInt(request.body.funeralHomeId, 10)
      : request.body.funeralHomeId

  response.json({
    success,

    funeralHomeId
  })
}
