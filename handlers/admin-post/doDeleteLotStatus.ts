import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getLotStatuses } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteStatusId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'LotStatuses',
    request.body.burialSiteStatusId,
    request.session.user as User
  )

  const lotStatuses = await getLotStatuses()

  response.json({
    success,
    lotStatuses
  })
}
