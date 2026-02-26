import type { Request, Response } from 'express'

import { updateBurialSiteLatitudeLongitude } from '../../database/updateBurialSite.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateBurialSiteLatitudeLongitudeResponse =
  { success: boolean }
  | { success: false; errorMessage: string }

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
