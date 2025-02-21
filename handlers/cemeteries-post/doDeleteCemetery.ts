import type { Request, Response } from 'express'

import { clearNextPreviousLotIdCache } from '../../helpers/functions.lots.js'
import { deleteRecord } from '../../database/deleteRecord.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'Maps',
    request.body.mapId,
    request.session.user as User
  )

  response.json({
    success
  })

  response.on('finish', () => {
    clearNextPreviousLotIdCache(-1)
  })
}

