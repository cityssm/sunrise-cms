import type { Request, Response } from 'express'

import getPreviouscemeteryId from '../../database/getPreviouscemeteryId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const cemeteryId = Number.parseInt(request.params.cemeteryId, 10)

  const previouscemeteryId = await getPreviouscemeteryId(cemeteryId)

  if (previouscemeteryId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/maps/?error=noPreviouscemeteryIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/maps/${previouscemeteryId.toString()}`
  )
}
