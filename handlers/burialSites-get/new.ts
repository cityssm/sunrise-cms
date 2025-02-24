import type { Request, Response } from 'express'

import getMaps from '../../database/getMaps.js'
import { getLotStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Lot } from '../../types/recordTypes.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lot: Lot = {
    lotId: -1,
    lotOccupancies: []
  }

  const maps = await getMaps()

  if (request.query.cemeteryId !== undefined) {
    const cemeteryId = Number.parseInt(request.query.cemeteryId as string, 10)

    const map = maps.find((possibleMap) => {
      return cemeteryId === possibleMap.cemeteryId
    })

    if (map !== undefined) {
      lot.cemeteryId = map.cemeteryId
      lot.cemeteryName = map.cemeteryName
    }
  }

  const lotTypes = await getBurialSiteTypes()
  const lotStatuses = await getLotStatuses()

  response.render('lot-edit', {
    headTitle: `Create a New ${getConfigProperty('aliases.lot')}`,
    lot,
    isCreate: true,
    maps,
    lotTypes,
    lotStatuses
  })
}
