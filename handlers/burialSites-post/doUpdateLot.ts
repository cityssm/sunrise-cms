import type { Request, Response } from 'express'

import updateLot, { type UpdateLotForm } from '../../database/updateLot.js'
import { clearNextPreviousLotIdCache } from '../../helpers/functions.lots.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotId = Number.parseInt(request.body.lotId as string, 10)

  const success = await updateLot(
    request.body as UpdateLotForm,
    request.session.user as User
  )

  response.json({
    success,
    lotId: request.body.lotId as string
  })

  response.on('finish', () => {
    clearNextPreviousLotIdCache(lotId)
  })
}
