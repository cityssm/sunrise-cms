import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatus: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  const burialSiteStatusId = addRecord(
    'BurialSiteStatuses',
    request.body.burialSiteStatus,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.json({
    success: true,

    burialSiteStatuses,
    burialSiteStatusId
  })
}
