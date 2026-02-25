import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(request: Request, response: Response): void {
  const cemeteries = getCemeteries()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.render('burialSites/gpsCapture', {
    headTitle: i18next.t('cemeteries:gpsCoordinateCapture', { lng: response.locals.lng }),

    burialSiteStatuses,
    burialSiteTypes,
    cemeteries,

    cemeteryId: request.query.cemeteryId,
    burialSiteTypeId: request.query.burialSiteTypeId
  })
}
