import type { Request, Response } from 'express'

import addBurialSite, {
  type AddBurialSiteForm
} from '../../database/addBurialSite.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteForm>,
  response: Response
): void {
  try {
    const burialSiteId = addBurialSite(
      request.body,
      request.session.user as User
    )

    response.json({
      success: true,

      burialSiteId
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
