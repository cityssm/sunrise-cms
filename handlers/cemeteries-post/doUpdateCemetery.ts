import type { Request, Response } from 'express'

import rebuildBurialSiteNames from '../../database/rebuildBurialSiteNames.js'
import updateCemetery, {
  type UpdateCemeteryForm
} from '../../database/updateCemetery.js'
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateCemeteryForm>,
  response: Response
): Promise<void> {
  const success = await updateCemetery(
    request.body,
    request.session.user as User
  )

  response.json({
    success,

    cemeteryId: request.body.cemeteryId
  })

  if (success) {
    response.on('finish', () => {
      void rebuildBurialSiteNames(
        request.body.cemeteryId,
        request.session.user as User
      )

      clearNextPreviousBurialSiteIdCache()
    })
  }
}
