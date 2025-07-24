import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, unknown, { tab?: string }>,
  response: Response
): void {
  const rightNow = new Date()

  const reportTab = request.query.tab ?? 'workOrders'

  const cemeteries = getCemeteries()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.render('report-search', {
    headTitle: 'Reports',
    reportTab,

    burialSiteStatuses,
    burialSiteTypes,
    cemeteries,
    todayDateString: dateToString(rightNow)
  })
}
