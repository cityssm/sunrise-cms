import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import getFuneralHomes from '../../database/getFuneralHomes.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    unknown,
    { cemeteryId?: string; contractNumber?: string; deceasedName?: string; error?: string }
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
  const serviceTypes = getCachedServiceTypes()

  response.render('contracts/search', {
    headTitle: i18next.t('contracts:contractSearch', { lng: response.locals.lng }),

    cemeteryId: request.query.cemeteryId,
    contractNumber: request.query.contractNumber ?? '',
    deceasedName: request.query.deceasedName ?? '',

    burialSiteTypes,
    cemeteries,
    contractTypes,
    funeralHomes,
    serviceTypes,

    error
  })
}
