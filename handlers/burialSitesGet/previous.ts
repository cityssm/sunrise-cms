import type { Request, Response } from 'express'

import { getPreviousBurialSiteId } from '../../helpers/burialSites.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ burialSiteId: string }>,
  response: Response
): void {
  const burialSiteId = Math.trunc(Number(request.params.burialSiteId))

  const previousBurialSiteId = getPreviousBurialSiteId(burialSiteId)

  if (previousBurialSiteId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/burialSites/?error=noPreviousBurialSiteIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/burialSites/${previousBurialSiteId.toString()}`
  )
}
