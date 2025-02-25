import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
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

  response.render('burialSiteContract-search', {
    headTitle: `Contract Search`,
    cemeteries,
    burialSiteTypes,
    contractTypes,
    cemeteryId: request.query.cemeteryId
  })
}
