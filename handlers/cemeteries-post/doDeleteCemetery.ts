import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, { cemeteryId: string | number }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'Cemeteries',
    request.body.cemeteryId,
    request.session.user as User
  )

  response.json({
    success
  })

  response.on('finish', () => {
    clearNextPreviousBurialSiteIdCache(-1)
  })
}
