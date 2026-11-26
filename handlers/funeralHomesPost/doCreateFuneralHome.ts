import type { Request, Response } from 'express'

import addFuneralHome, { type AddForm } from '../../database/addFuneralHome.js'

export type DoCreateFuneralHomeResponse = {
  funeralHomeId: number
}

export default function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response<DoCreateFuneralHomeResponse>
): void {
  const funeralHomeId = addFuneralHome(
    request.body,
    request.session.user as User
  )

  response.json({
    funeralHomeId
  })
}
