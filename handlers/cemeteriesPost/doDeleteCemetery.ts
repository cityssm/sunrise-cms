import type { Request, Response } from 'express'

import deleteCemetery from '../../database/deleteCemetery.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js'

export type DoDeleteCemeteryResponse =
  | {
      errorMessage: string
      success: false
    }
  | {
      success: true
    }

export default function handler(
  request: Request<unknown, unknown, { cemeteryId: number | string }>,
  response: Response<DoDeleteCemeteryResponse>
): void {
  const success = deleteCemetery(
    request.body.cemeteryId,
    request.session.user as User
  )

  if (!success) {
    response.status(400).json({
      errorMessage:
        'Note that cemeteries with active contracts cannot be deleted.',
      success: false
    })
    return
  }

  response.on('finish', () => {
    clearNextPreviousBurialSiteIdCache()
    getCachedCemeteries()
  })

  response.json({
    success
  })
}
