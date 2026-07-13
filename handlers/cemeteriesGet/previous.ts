import type { Request, Response } from 'express'

import getPreviousCemeteryId from '../../database/getPreviousCemeteryId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ cemeteryId: string }>,
  response: Response
): void {
  const cemeteryId = Number.parseInt(request.params.cemeteryId, 10)

  const previousCemeteryId = getPreviousCemeteryId(cemeteryId)

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
