import type { Request, Response } from 'express'

import { getNextBurialSiteId } from '../../helpers/burialSites.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ burialSiteId: string }>,
  response: Response
): void {
  const burialSiteId = Math.trunc(Number(request.params.burialSiteId))

  const nextBurialSiteId = getNextBurialSiteId(burialSiteId)

  if (nextBurialSiteId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/burialSites/?error=noNextBurialSiteIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/burialSites/${nextBurialSiteId.toString()}`
  )
}
