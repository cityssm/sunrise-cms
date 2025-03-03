import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'

export default async function handler(
  request: Request<unknown, unknown, { funeralHomeId: string | number }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'FuneralHomes',
    request.body.funeralHomeId,
    request.session.user as User
  )

  response.json({
    success
  })
}
