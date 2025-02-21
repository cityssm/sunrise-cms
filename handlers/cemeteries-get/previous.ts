import type { Request, Response } from 'express'

import getPreviousMapId from '../../database/getPreviousMapId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const mapId = Number.parseInt(request.params.mapId, 10)

  const previousMapId = await getPreviousMapId(mapId)

  if (previousMapId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/maps/?error=noPreviousMapIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/maps/${previousMapId.toString()}`
  )
}
