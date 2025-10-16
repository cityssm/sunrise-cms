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
    { cemeteryId?: string; deceasedName?: string; error?: string }
  >,
  response: Response
): void {
  let error = request.query.error

  switch (error) {
    case 'contractIdNotFound': {
      error = 'Contract ID not found.'

      break
    }
    case 'noNextContractIdFound': {
      error = 'No next Contract ID found.'

      break
    }
    case 'noPreviousContractIdFound': {
      error = 'No previous Contract ID found.'

      break
    }
    // No default
  }

  const cemeteries = getCemeteries()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const contractTypes = getCachedContractTypes()
  const funeralHomes = getFuneralHomes()

  response.render('contracts/search', {
    headTitle: 'Contract Search',

    cemeteryId: request.query.cemeteryId,
    deceasedName: request.query.deceasedName,

    burialSiteTypes,
    cemeteries,
    contractTypes,
    funeralHomes,

    error
  })
}
