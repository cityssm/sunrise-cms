import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getMaps from '../../database/getMaps.js'
import { getLotStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const rightNow = new Date()

  const maps = await getMaps()
  const lotTypes = await getBurialSiteTypes()
  const lotStatuses = await getLotStatuses()

  response.render('report-search', {
    headTitle: 'Reports',
    todayDateString: dateToString(rightNow),
    maps,
    lotTypes,
    lotStatuses
  })
}
