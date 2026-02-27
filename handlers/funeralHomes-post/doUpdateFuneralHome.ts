import type { Request, Response } from 'express'

import updateFuneralHome, {
  type UpdateForm
} from '../../database/updateFuneralHome.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateFuneralHomeResponse = {
  success: boolean

  funeralHomeId: number | string
}

export default function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response<DoUpdateFuneralHomeResponse>
): void {
  const success = updateFuneralHome(request.body, request.session.user as User)

  response.json({
    success,

    funeralHomeId: request.body.funeralHomeId
  })
}
