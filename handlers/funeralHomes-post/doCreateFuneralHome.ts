import type { Request, Response } from 'express'

import addFuneralHome, { type AddForm } from '../../database/addFuneralHome.js'

export default async function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response
): Promise<void> {
  const funeralHomeId = await addFuneralHome(
    request.body,
    request.session.user as User
  )

  response.json({
    success: true,
    
    funeralHomeId
  })
}
