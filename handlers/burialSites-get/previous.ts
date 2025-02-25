import type { Request, Response } from 'express'

import { getPreviousBurialSiteId } from '../../helpers/burialSites.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const burialSiteId = Number.parseInt(request.params.burialSiteId, 10)

  const previousBurialSiteId = await getPreviousBurialSiteId(burialSiteId)

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
