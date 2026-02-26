import type { Request, Response } from 'express'

import deleteCemetery from '../../database/deleteCemetery.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteCemeteryResponse =
  { errorMessage: string; success: boolean }

export default function handler(
  request: Request<unknown, unknown, { cemeteryId: number | string }>,
  response: Response<DoDeleteCemeteryResponse>
): void {
  const success = deleteCemetery(
    request.body.cemeteryId,
    request.session.user as User
  )

  response.json({
    errorMessage: success
      ? ''
      : 'Note that cemeteries with active contracts cannot be deleted.',
    success
  })

  if (success) {
    response.on('finish', () => {
      clearNextPreviousBurialSiteIdCache()
    })
  }
}
