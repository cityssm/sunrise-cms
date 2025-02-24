import type { Request, Response } from 'express'

import addMap, { type AddMapForm } from '../../database/addMap.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const cemeteryId = await addMap(
    request.body as AddMapForm,
    request.session.user as User
  )

  response.json({
    success: true,
    cemeteryId
  })
}

