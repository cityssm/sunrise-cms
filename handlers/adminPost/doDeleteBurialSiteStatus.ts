import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import type { BurialSiteStatus } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteBurialSiteStatusResponse = {
  success: boolean

  burialSiteStatuses: BurialSiteStatus[]
}

export default function handler(
  request: Request<unknown, unknown, { burialSiteStatusId: string }>,
  response: Response<DoDeleteBurialSiteStatusResponse>
): void {
  const success = deleteRecord(
    'BurialSiteStatuses',
    request.body.burialSiteStatusId,
    request.session.user as User
  )

  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.json({
    success,

    burialSiteStatuses
  })
}
