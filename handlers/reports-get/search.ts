import type { Request, Response } from 'express'

import { dateToString } from '@cityssm/utils-datetime'

import getCemeteries from '../../database/getCemeteries.js'
import {
  getBurialSiteStatuses,
  getBurialSiteTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { tab?: string }>,
  response: Response
): Promise<void> {
  const rightNow = new Date()

  const reportTab = request.query.tab ?? 'workOrders'

  const cemeteries = await getCemeteries()
  const burialSiteTypes = await getBurialSiteTypes()
  const burialSiteStatuses = await getBurialSiteStatuses()

  response.render('report-search', {
    headTitle: 'Reports',
    reportTab,

    burialSiteStatuses,
    burialSiteTypes,
    cemeteries,
    todayDateString: dateToString(rightNow)
  })
}
