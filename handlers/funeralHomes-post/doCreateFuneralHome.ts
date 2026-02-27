import type { Request, Response } from 'express'

import addFuneralHome, { type AddForm } from '../../database/addFuneralHome.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCreateFuneralHomeResponse = {
  success: true

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
    success: true,

    funeralHomeId
  })
}
