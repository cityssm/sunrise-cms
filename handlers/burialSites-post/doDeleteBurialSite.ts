import type { Request, Response } from 'express'

import { deleteBurialSite } from '../../database/deleteBurialSite.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { burialSiteId: string }>,
  response: Response
): void {
  const burialSiteId = Number.parseInt(request.body.burialSiteId, 10)

  const success = deleteBurialSite(burialSiteId, request.session.user as User)

  response.json({
    success,

    errorMessage: success
      ? ''
      : 'Note that burial sites with active contracts cannot be deleted.'
  })

  if (success) {
    response.on('finish', () => {
      clearNextPreviousBurialSiteIdCache(burialSiteId)
    })
  }
}
