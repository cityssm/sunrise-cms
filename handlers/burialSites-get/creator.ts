import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import {
  getBurialSiteStatuses,
  getBurialSiteTypes
} from '../../helpers/cache.helpers.js'

export default function handler(request: Request, response: Response): void {
  const cemeteries = getCemeteries()
  const burialSiteTypes = getBurialSiteTypes()
  const burialSiteStatuses = getBurialSiteStatuses()

  response.render('burialSite-creator', {
    headTitle: 'Burial Site Range Creator',

    burialSiteStatuses,
    burialSiteTypes,
    cemeteries
  })
}
