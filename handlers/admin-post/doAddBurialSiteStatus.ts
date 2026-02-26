import type { Request, Response } from 'express'

import { addBurialSiteStatus } from '../../database/addRecord.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'

import type { BurialSiteStatus } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddBurialSiteStatusResponse =
  { success: true; burialSiteStatuses: BurialSiteStatus[]; burialSiteStatusId: number }

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
    success: true,

    burialSiteStatuses,
    burialSiteStatusId
  })
}
