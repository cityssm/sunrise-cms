import type { Request, Response } from 'express'

import deleteCemetery from '../../database/deleteCemetery.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, { cemeteryId: number | string }>,
  response: Response
): Promise<void> {
  const success = await deleteCemetery(
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
      clearNextPreviousBurialSiteIdCache(-1)
    })
  }
}
