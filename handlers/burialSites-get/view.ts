import type { Request, Response } from 'express'

import getBurialSite from '../../database/getBurialSite.js'
import {
  getNextBurialSiteId,
  getPreviousBurialSiteId
} from '../../helpers/burialSites.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const burialSite = await getBurialSite(
    request.params.burialSiteId,
    request.session.user?.userProperties.canUpdate
  )

  if (burialSite === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/burialSites/?error=burialSiteIdNotFound`
    )
    return
  }

  const burialSiteIsDeleted = burialSite.recordDelete_timeMillis !== null

  response.render('burialSite-view', {
    headTitle: burialSite.burialSiteName,

    burialSite
  })

  if (!burialSiteIsDeleted) {
    response.on('finish', () => {
      getNextBurialSiteId(burialSite.burialSiteId)
      getPreviousBurialSiteId(burialSite.burialSiteId)
    })
  }
}
