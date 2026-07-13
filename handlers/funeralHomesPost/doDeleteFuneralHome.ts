import type { Request, Response } from 'express'

import deleteFuneralHome from '../../database/deleteFuneralHome.js'

export type DoDeleteFuneralHomeResponse =
  | {
      success: false

      errorMessage: string
    }
  | {
      success: true
    }

export default function handler(
  request: Request<unknown, unknown, { funeralHomeId: number | string }>,
  response: Response<DoDeleteFuneralHomeResponse>
): void {
  const success = deleteFuneralHome(
    request.body.funeralHomeId,
    request.session.user as User
  )

  if (success) {
    response.json({
      success: true
    })
  } else {
    response.json({
      success: false,

      errorMessage:
        'Note that funeral homes with current or upcoming funerals cannot be deleted.'
    })
  }
}
