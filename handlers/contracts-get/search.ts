import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import getFuneralHomes from '../../database/getFuneralHomes.js'
import {
  getBurialSiteTypes,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const cemeteries = await getCemeteries()
  const burialSiteTypes = await getBurialSiteTypes()
  const contractTypes = await getContractTypes()
  const funeralHomes = await getFuneralHomes()

  response.render('contract-search', {
    headTitle: "Contract Search",
    cemeteries,
    burialSiteTypes,
    contractTypes,
    funeralHomes,
    cemeteryId: request.query.cemeteryId
  })
}
