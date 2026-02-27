import type { Request, Response } from 'express'

import updateFuneralHome, {
  type UpdateForm
} from '../../database/updateFuneralHome.js'

export type DoUpdateFuneralHomeResponse =
  | {
      success: false

      errorMessage: string
    }
  | {
      success: true

      funeralHomeId: number | string
    }

export default function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response<DoUpdateFuneralHomeResponse>
): void {
  const success = updateFuneralHome(request.body, request.session.user as User)

  if (!success) {
    response.status(400).json({
      errorMessage: 'Failed to update funeral home',
      success: false
    })
    return
  }

  response.json({
    success,

    funeralHomeId: request.body.funeralHomeId
  })
}
