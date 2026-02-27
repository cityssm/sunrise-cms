import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import type { BurialSiteStatus } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveBurialSiteStatusUpResponse = {
  success: boolean

  burialSiteStatuses: BurialSiteStatus[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatusId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveBurialSiteStatusUpResponse>
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
