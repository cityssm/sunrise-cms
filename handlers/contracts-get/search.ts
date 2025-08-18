import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import getFuneralHomes from '../../database/getFuneralHomes.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    unknown,
    { cemeteryId?: string; deceasedName?: string }
  >,
  response: Response
): void {
  const cemeteries = getCemeteries()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const contractTypes = getCachedContractTypes()
  const funeralHomes = getFuneralHomes()

  response.render('contract-search', {
    headTitle: 'Contract Search',

    cemeteryId: request.query.cemeteryId,
    deceasedName: request.query.deceasedName,

    burialSiteTypes,
    cemeteries,
    contractTypes,
    funeralHomes
  })
}
