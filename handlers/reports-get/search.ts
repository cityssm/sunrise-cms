import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(
  request: Request<unknown, unknown, unknown, { tab?: string }>,
  response: Response
): void {
  const rightNow = new Date()

  const reportTab = request.query.tab ?? 'contracts'

  const cemeteries = getCemeteries()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.render('report-search', {
    headTitle: i18next.t('dashboard:reports', { lng: response.locals.lng }),
    reportTab,

    burialSiteStatuses,
    burialSiteTypes,
    cemeteries,
    todayDateString: dateToString(rightNow)
  })
}
