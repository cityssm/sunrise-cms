import type { Request, Response } from 'express'

import { getNextBurialSiteId } from '../../helpers/burialSites.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const burialSiteId = Number.parseInt(request.params.burialSiteId, 10)

  const nextBurialSiteId = await getNextBurialSiteId(burialSiteId)

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
