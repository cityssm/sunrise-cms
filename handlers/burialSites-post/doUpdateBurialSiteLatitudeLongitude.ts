import type { Request, Response } from 'express'

import { updateBurialSiteLatitudeLongitude } from '../../database/updateBurialSite.js'

export type DoUpdateBurialSiteLatitudeLongitudeResponse =
  | { success: false; errorMessage: string }
  | { success: true }

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
  response: Response<DoUpdateBurialSiteLatitudeLongitudeResponse>
): void {
  try {
    const success = updateBurialSiteLatitudeLongitude(
      request.body.burialSiteId,
      request.body.burialSiteLatitude,
      request.body.burialSiteLongitude,
      request.session.user as User
    )

    if (!success) {
      response.status(400).json({
        success: false,
        errorMessage: 'Failed to update burial site latitude and longitude'
      })
      return
    }

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
