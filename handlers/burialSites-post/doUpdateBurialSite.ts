import type { Request, Response } from 'express'

import updateBurialSite, {
  type UpdateBurialSiteForm
} from '../../database/updateBurialSite.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export type DoUpdateBurialSiteResponse =
  | { success: false; errorMessage: string }
  | { success: true; burialSiteId: number }

export default function handler(
  request: Request<unknown, unknown, UpdateBurialSiteForm>,
  response: Response<DoUpdateBurialSiteResponse>
): void {
  try {
    const success = updateBurialSite(request.body, request.session.user as User)

    if (!success) {
      response
        .status(400)
        .json({ success: false, errorMessage: 'Failed to update burial site' })
      return
    }

    const burialSiteId =
      typeof request.body.burialSiteId === 'string'
        ? Number.parseInt(request.body.burialSiteId, 10)
        : request.body.burialSiteId

    response.on('finish', () => {
      clearNextPreviousBurialSiteIdCache(burialSiteId)
    })

    response.json({
      success,

      burialSiteId
    })
  } catch (error) {
    response.json({
      success: false,

      errorMessage: (error as Error).message
    })
  }
}
