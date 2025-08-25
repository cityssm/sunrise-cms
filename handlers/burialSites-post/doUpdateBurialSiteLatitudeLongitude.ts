import type { Request, Response } from 'express'

import { updateBurialSiteLatitudeLongitude } from '../../database/updateBurialSite.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      burialSiteId: string
      burialSiteLatitude: string
      burialSiteLongitude: string
    }
  >,
  response: Response
): void {
  try {
    const success = updateBurialSiteLatitudeLongitude(
      request.body.burialSiteId,
      request.body.burialSiteLatitude,
      request.body.burialSiteLongitude,
      request.session.user as User
    )

    response.json({
      success
    })
  } catch (error) {
    response.json({
      success: false,

      errorMessage: (error as Error).message
    })
  }
}
