import type { Request, Response } from 'express'

import updateFuneralHome, {
  type UpdateForm
} from '../../database/updateFuneralHome.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response
): Promise<void> {
  const success = await updateFuneralHome(
    request.body,
    request.session.user as User
  )

  response.json({
    success,
    funeralHomeId: request.body.funeralHomeId
  })
}
