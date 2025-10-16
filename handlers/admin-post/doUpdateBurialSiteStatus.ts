import type { Request, Response } from 'express'

import { updateBurialSiteStatus } from '../../database/updateRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatusId: string; burialSiteStatus: string }
  >,
  response: Response
): void {
  const success = updateBurialSiteStatus(
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
