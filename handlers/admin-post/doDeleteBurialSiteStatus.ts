import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, { burialSiteStatusId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'BurialSiteStatuses',
    request.body.burialSiteStatusId,
    request.session.user as User
  )

  const burialSiteStatuses = getBurialSiteStatuses()

  response.json({
    success,
    
    burialSiteStatuses
  })
}
