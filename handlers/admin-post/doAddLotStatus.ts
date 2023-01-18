import type { Request, Response } from 'express'

import { addRecord } from '../../helpers/lotOccupancyDB/addRecord.js'
import { getLotStatuses } from '../../helpers/functions.cache.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotStatusId = await addRecord(
    'LotStatuses',
    request.body.lotStatus,
    request.body.orderNumber ?? -1,
    request.session
  )

  const lotStatuses = await getLotStatuses()

  response.json({
    success: true,
    lotStatusId,
    lotStatuses
  })
}

export default handler
