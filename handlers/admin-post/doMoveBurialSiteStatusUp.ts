import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js'

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

  const burialSiteStatuses = getBurialSiteStatuses()

  response.json({
    success,

    burialSiteStatuses
  })
}
