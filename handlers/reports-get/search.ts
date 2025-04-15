import type { Request, Response } from 'express'

import { dateToString } from '@cityssm/utils-datetime'

import getCemeteries from '../../database/getCemeteries.js'
import {
  getBurialSiteStatuses,
  getBurialSiteTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const rightNow = new Date()

  const cemeteries = await getCemeteries()
  const burialSiteTypes = await getBurialSiteTypes()
  const burialSiteStatuses = await getBurialSiteStatuses()

  response.render('report-search', {
    headTitle: 'Reports',

    burialSiteStatuses,
    burialSiteTypes,
    cemeteries,
    todayDateString: dateToString(rightNow)
  })
}
