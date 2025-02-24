import type { Request, Response } from 'express'

import getBurialSiteStatusSummary from '../../database/getBurialSiteStatusSummary.js'
import getBurialSiteTypeSummary from '../../database/getBurialSiteTypeSummary.js'
import getCemetery from '../../database/getCemetery.js'
import { getCemeterySVGs } from '../../helpers/cemeteries.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const cemetery = await getCemetery(request.params.cemeteryId)

  if (cemetery === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/?error=cemeteryIdNotFound`
    )
    return
  }

  const cemeterySVGs = await getCemeterySVGs()

  const burialSiteTypeSummary = await getBurialSiteTypeSummary({
    cemeteryId: cemetery.cemeteryId
  })

  const burialSiteStatusSummary = await getBurialSiteStatusSummary({
    cemeteryId: cemetery.cemeteryId
  })

  response.render('map-edit', {
    headTitle: cemetery.cemeteryName,
    isCreate: false,
    cemetery,
    cemeterySVGs,
    burialSiteTypeSummary,
    burialSiteStatusSummary
  })
}
