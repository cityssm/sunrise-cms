import type { Request, Response } from 'express'

import getNextCemeteryId from '../../database/getNextCemeteryId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ cemeteryId: string }>,
  response: Response
): void {
  const cemeteryId = Number.parseInt(request.params.cemeteryId, 10)

  const nextCemeteryId = getNextCemeteryId(cemeteryId)

  if (nextCemeteryId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/cemeteries/?error=noNextCemeteryIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/cemeteries/${nextCemeteryId.toString()}`
  )
}
