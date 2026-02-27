import type { Request, Response } from 'express'

import addBurialSite, {
  type AddBurialSiteForm
} from '../../database/addBurialSite.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export type DoCreateBurialSiteResponse =
  | { success: false; errorMessage: string }
  | { success: true; burialSiteId: number; burialSiteName: string }

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteForm>,
  response: Response<DoCreateBurialSiteResponse>
): void {
  try {
    const burialSite = addBurialSite(request.body, request.session.user as User)

    response.json({
      success: true,

      burialSiteId: burialSite.burialSiteId,
      burialSiteName: burialSite.burialSiteName
    })

    response.on('finish', () => {
      clearNextPreviousBurialSiteIdCache(-1)
    })
  } catch (error) {
    response.json({
      success: false,

      errorMessage: (error as Error).message
    })
  }
}
