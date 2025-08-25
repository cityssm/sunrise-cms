import type { Request, Response } from 'express'

import getBurialSites from '../../database/getBurialSites.js'
import getCemeteries from '../../database/getCemeteries.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(request: Request, response: Response): void {
  const cemeteries = getCemeteries()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const burialSiteStatuses = getCachedBurialSiteStatuses()

  // Get all burial sites for GPS capture
  const result = getBurialSites(
    {},
    {
      limit: 1000, // Get a large number of burial sites
      offset: 0,
      includeContractCount: false
    }
  )

  response.render('burialSite-gpsCapture', {
    headTitle: 'GPS Coordinate Capture',
    
    burialSites: result.burialSites,
    burialSiteStatuses,
    burialSiteTypes,
    cemeteries,
    
    cemeteryId: request.query.cemeteryId,
    burialSiteTypeId: request.query.burialSiteTypeId
  })
}