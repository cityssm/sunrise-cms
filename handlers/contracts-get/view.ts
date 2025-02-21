import type { Request, Response } from 'express'

import getLotOccupancy from '../../database/getLotOccupancy.js'
import { getOccupancyTypePrintsById } from '../../helpers/functions.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotOccupancy = await getLotOccupancy(request.params.lotOccupancyId)

  if (lotOccupancy === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/lotOccupancies/?error=lotOccupancyIdNotFound`
    )
    return
  }

  const occupancyTypePrints = await getOccupancyTypePrintsById(
    lotOccupancy.occupancyTypeId
  )

  response.render('lotOccupancy-view', {
    headTitle: `${getConfigProperty('aliases.occupancy')} View`,
    lotOccupancy,
    occupancyTypePrints
  })
}
