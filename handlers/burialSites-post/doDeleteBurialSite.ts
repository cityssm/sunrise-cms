import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteId: string }>,
  response: Response
): Promise<void> {
  const burialSiteId = Number.parseInt(request.body.burialSiteId, 10)

  const success = await deleteRecord(
    'BurialSites',
    burialSiteId,
    request.session.user as User
  )

  response.json({
    success
  })

  response.on('finish', () => {
    clearNextPreviousBurialSiteIdCache(burialSiteId)
  })
}
