import type { Request, Response } from 'express'

import addCemetery, {
  type AddCemeteryForm
} from '../../database/addCemetery.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCreateCemeteryResponse = { success: true; cemeteryId: number }

export default function handler(
  request: Request<unknown, unknown, AddCemeteryForm>,
  response: Response<DoCreateCemeteryResponse>
): void {
  const cemeteryId = addCemetery(request.body, request.session.user as User)

  response.json({
    success: true,

    cemeteryId
  })
}
