import type { Request, Response } from 'express'

import updateFuneralHome, {
  type UpdateForm
} from '../../database/updateFuneralHome.js'

export default function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response
): void {
  const success = updateFuneralHome(request.body, request.session.user as User)

  response.json({
    success,

    funeralHomeId: request.body.funeralHomeId
  })
}
