import type { Request, Response } from 'express'

import { deleteBurialSite } from '../../database/deleteBurialSite.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteBurialSiteResponse =
  { success: boolean; errorMessage: string }

export default function handler(
  request: Request<unknown, unknown, { burialSiteId: string }>,
  response: Response<DoDeleteBurialSiteResponse>
): void {
  const burialSiteId = Number.parseInt(request.body.burialSiteId, 10)

  const success = deleteBurialSite(burialSiteId, request.session.user as User)

  response.json({
    success,

    errorMessage: success
      ? ''
      : 'Note that burial sites with active contracts cannot be deleted.'
  })

  if (success) {
    response.on('finish', () => {
      clearNextPreviousBurialSiteIdCache(burialSiteId)
    })
  }
}
