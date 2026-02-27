import type { Request, Response } from 'express'

import rebuildBurialSiteNames from '../../database/rebuildBurialSiteNames.js'
import updateCemetery, {
  type UpdateCemeteryForm
} from '../../database/updateCemetery.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateCemeteryResponse = {
  success: boolean

  cemeteryId: number | string
}

export default function handler(
  request: Request<unknown, unknown, UpdateCemeteryForm>,
  response: Response<DoUpdateCemeteryResponse>
): void {
  const success = updateCemetery(request.body, request.session.user as User)

  response.json({
    success,

    cemeteryId: request.body.cemeteryId
  })

  if (success) {
    response.on('finish', () => {
      rebuildBurialSiteNames(
        request.body.cemeteryId,
        request.session.user as User
      )

      clearNextPreviousBurialSiteIdCache()
    })
  }
}
