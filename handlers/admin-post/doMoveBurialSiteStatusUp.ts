import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatusId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('BurialSiteStatuses', request.body.burialSiteStatusId)
      : moveRecordUp('BurialSiteStatuses', request.body.burialSiteStatusId)

  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.json({
    success,

    burialSiteStatuses
  })
}
