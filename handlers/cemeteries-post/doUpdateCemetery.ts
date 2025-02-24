import type { Request, Response } from 'express'

import updateCemetery, {
  type UpdateCemeteryForm
} from '../../database/updateCemetery.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateCemeteryForm>,
  response: Response
): Promise<void> {
  const success = await updateCemetery(
    request.body,
    request.session.user as User
  )

  response.json({
    success,
    cemeteryId: request.body.cemeteryId
  })
}
