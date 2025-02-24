import type { Request, Response } from 'express'

import getMaps from '../../database/getMaps.js'
import {
  getBurialSiteTypes,
  getContractTypes
} from '../../helpers/functions.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const maps = await getMaps()
  const lotTypes = await getBurialSiteTypes()
  const occupancyTypes = await getContractTypes()

  response.render('lotOccupancy-search', {
    headTitle: `${getConfigProperty('aliases.occupancy')} Search`,
    maps,
    lotTypes,
    occupancyTypes,
    cemeteryId: request.query.cemeteryId
  })
}
