import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js'

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

  const burialSiteStatuses = getBurialSiteStatuses()

  response.json({
    success: true,

    burialSiteStatuses,
    burialSiteStatusId
  })
}
