import type { Request, Response } from 'express'

import { updateBurialSiteStatus } from '../../database/updateRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import type { BurialSiteStatus } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateBurialSiteStatusResponse = {
  success: boolean
  burialSiteStatuses: BurialSiteStatus[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatusId: string; burialSiteStatus: string }
  >,
  response: Response<DoUpdateBurialSiteStatusResponse>
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
