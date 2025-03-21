import type { Request, Response } from 'express'

import updateBurialSite, {
  type UpdateBurialSiteForm
} from '../../database/updateBurialSite.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateBurialSiteForm>,
  response: Response
): Promise<void> {
  try {
    const success = await updateBurialSite(
      request.body,
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

    response.on('finish', () => {
      clearNextPreviousBurialSiteIdCache(burialSiteId)
    })
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    })
  }
}
