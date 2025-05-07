import type { Request, Response } from 'express'

import getNextFuneralHomeId from '../../database/getNextFuneralHome.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ funeralHomeId: string }>,
  response: Response
): void {
  const funeralHomeId = Number.parseInt(request.params.funeralHomeId, 10)

  const nextFuneralHomeId = getNextFuneralHomeId(funeralHomeId)

  if (nextFuneralHomeId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/funeralHomes/?error=noNextFuneralHomeIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/funeralHomes/${nextFuneralHomeId.toString()}`
  )
}
