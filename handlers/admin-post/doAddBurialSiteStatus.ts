import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatus: string; orderNumber?: string | number }
  >,
  response: Response
): Promise<void> {
  const burialSiteStatusId = await addRecord(
    'BurialSiteStatuses',
    request.body.burialSiteStatus,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const burialSiteStatuses = await getBurialSiteStatuses()

  response.json({
    success: true,
    burialSiteStatusId,
    burialSiteStatuses
  })
}
