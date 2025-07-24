import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatusId: string; burialSiteStatus: string }
  >,
  response: Response
): void {
  const success = updateRecord(
    'BurialSiteStatuses',
    request.body.burialSiteStatusId,
    request.body.burialSiteStatus,
    request.session.user as User
  )

  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.json({
    success,

    burialSiteStatuses
  })
}
