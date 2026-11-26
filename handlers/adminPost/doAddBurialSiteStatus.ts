import type { Request, Response } from 'express'

import { addBurialSiteStatus } from '../../database/addRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import type { BurialSiteStatus } from '../../types/record.types.js'

export type DoAddBurialSiteStatusResponse = {
  burialSiteStatuses: BurialSiteStatus[]
  burialSiteStatusId: number
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatus: string; orderNumber?: number | string }
  >,
  response: Response<DoAddBurialSiteStatusResponse>
): void {
  const burialSiteStatusId = addBurialSiteStatus(
    request.body.burialSiteStatus,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.json({
    burialSiteStatuses,
    burialSiteStatusId
  })
}
