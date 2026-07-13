import type { Request, Response } from 'express'

import { deleteBurialSite } from '../../database/deleteBurialSite.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export type DoDeleteBurialSiteResponse =
  | { errorMessage: string; success: false }
  | { success: true }

export default function handler(
  request: Request<unknown, unknown, { burialSiteId: string }>,
  response: Response<DoDeleteBurialSiteResponse>
): void {
  const burialSiteId = Number.parseInt(request.body.burialSiteId, 10)

  const success = deleteBurialSite(burialSiteId, request.session.user as User)

  if (!success) {
    response.status(400).json({
      errorMessage:
        'Note that burial sites with active contracts cannot be deleted.',
      success: false
    })
    return
  }

  response.on('finish', () => {
    clearNextPreviousBurialSiteIdCache(burialSiteId)
  })

  response.json({
    success
  })
}
