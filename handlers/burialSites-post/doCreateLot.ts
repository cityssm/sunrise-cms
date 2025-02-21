import type { Request, Response } from 'express'

import addLot, { type AddLotForm } from '../../database/addLot.js'
import { clearNextPreviousLotIdCache } from '../../helpers/functions.lots.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotId = await addLot(
    request.body as AddLotForm,
    request.session.user as User
  )

  response.json({
    success: true,
    lotId
  })

  response.on('finish', () => {
    clearNextPreviousLotIdCache(-1)
  })
}

