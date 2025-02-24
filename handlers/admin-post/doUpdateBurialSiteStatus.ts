import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatusId: string; burialSiteStatus: string }
  >,
  response: Response
): Promise<void> {
  const success = await updateRecord(
    'BurialSiteStatuses',
    request.body.burialSiteStatusId,
    request.body.burialSiteStatus,
    request.session.user as User
  )

  const burialSiteStatuses = await getBurialSiteStatuses()

  response.json({
    success,
    burialSiteStatuses
  })
}
