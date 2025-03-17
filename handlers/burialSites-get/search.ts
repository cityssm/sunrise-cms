import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import {
  getBurialSiteStatuses,
  getBurialSiteTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const cemeteries = await getCemeteries()
  const burialSiteTypes = await getBurialSiteTypes()
  const burialSiteStatuses = await getBurialSiteStatuses()

  response.render('burialSite-search', {
    headTitle: "Burial Site Search",
    cemeteries,
    burialSiteTypes,
    burialSiteStatuses,
    cemeteryId: request.query.cemeteryId,
    burialSiteTypeId: request.query.burialSiteTypeId,
    burialSiteStatusId: request.query.burialSiteStatusId
  })
}
