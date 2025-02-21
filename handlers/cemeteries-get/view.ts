import type { Request, Response } from 'express'

import getLotStatusSummary from '../../database/getLotStatusSummary.js'
import getLotTypeSummary from '../../database/getLotTypeSummary.js'
import getMap from '../../database/getMap.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const map = await getMap(request.params.mapId)

  if (map === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/maps/?error=mapIdNotFound`
    )
    return
  }

  const lotTypeSummary = await getLotTypeSummary({
    mapId: map.mapId
  })

  const lotStatusSummary = await getLotStatusSummary({
    mapId: map.mapId
  })

  response.render('map-view', {
    headTitle: map.mapName,
    map,
    lotTypeSummary,
    lotStatusSummary
  })
}
