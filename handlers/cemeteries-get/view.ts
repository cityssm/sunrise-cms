import type { Request, Response } from 'express'

import getBurialSiteStatusSummary from '../../database/getBurialSiteStatusSummary.js'
import getBurialSiteTypeSummary from '../../database/getBurialSiteTypeSummary.js'
import getCemetery from '../../database/getCemetery.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ cemeteryId: string }>,
  response: Response
): void {
  const cemetery = getCemetery(request.params.cemeteryId)

  if (cemetery === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/?error=cemeteryIdNotFound`
    )
    return
  }

  const burialSiteTypeSummary = getBurialSiteTypeSummary({
    cemeteryId: cemetery.cemeteryId
  })

  const burialSiteStatusSummary = getBurialSiteStatusSummary({
    cemeteryId: cemetery.cemeteryId
  })

  response.render('cemetery-view', {
    headTitle: cemetery.cemeteryName,

    cemetery,

    burialSiteStatusSummary,
    burialSiteTypeSummary
  })
}
