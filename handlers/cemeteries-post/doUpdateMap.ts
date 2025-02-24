import type { Request, Response } from 'express'

import updateMap, { type UpdateMapForm } from '../../database/updateMap.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateMap(
    request.body as UpdateMapForm,
    request.session.user as User
  )

  response.json({
    success,
    cemeteryId: request.body.cemeteryId as string
  })
}
