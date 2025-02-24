import type { Request, Response } from 'express'

import getPreviousCemeteryId from '../../database/getPreviousCemeteryId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const cemeteryId = Number.parseInt(request.params.cemeteryId, 10)

  const previousCemeteryId = await getPreviousCemeteryId(cemeteryId)

  if (previousCemeteryId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/cemeteries/?error=noPreviousCemeteryIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/cemeteries/${previousCemeteryId.toString()}`
  )
}
