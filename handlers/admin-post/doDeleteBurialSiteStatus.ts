import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteStatusId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'BurialSiteStatuses',
    request.body.burialSiteStatusId,
    request.session.user as User
  )

  const burialSiteStatuses = await getBurialSiteStatuses()

  response.json({
    success,
    burialSiteStatuses
  })
}
