import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'

export default function handler(
  request: Request<unknown, unknown, { funeralHomeId: number | string }>,
  response: Response
): void {
  const success = deleteRecord(
    'FuneralHomes',
    request.body.funeralHomeId,
    request.session.user as User
  )

  response.json({
    success
  })
}
