import type { Request, Response } from 'express'

import addCemetery, {
  type AddCemeteryForm
} from '../../database/addCemetery.js'

export default async function handler(
  request: Request<unknown, unknown, AddCemeteryForm>,
  response: Response
): Promise<void> {
  const cemeteryId = await addCemetery(
    request.body,
    request.session.user as User
  )

  response.json({
    success: true,
    
    cemeteryId
  })
}
