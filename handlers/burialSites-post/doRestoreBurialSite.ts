import type { Request, Response } from 'express'

import { restoreBurialSite } from '../../database/restoreBurialSite.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { burialSiteId: number }>,
  response: Response
): void {
  const success = restoreBurialSite(
    request.body.burialSiteId,
    request.session.user as User
  )

  const burialSiteId =
    typeof request.body.burialSiteId === 'string'
      ? Number.parseInt(request.body.burialSiteId, 10)
      : request.body.burialSiteId

  response.json({
    success,

    burialSiteId
  })

  if (success) {
    response.on('finish', () => {
      clearNextPreviousBurialSiteIdCache()
    })
  }
}
