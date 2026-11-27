import type { Request, Response } from 'express'

import getContracts from '../../database/getContracts.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import getFuneralHomes from '../../database/getFuneralHomes.js'
import { getUnprocessedOrderFormCount } from '../../database/getOrderForms.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js'
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { i18next } from '../../helpers/i18n.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  let { error } = request.query

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
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

  /*
   * If a contract number is provided, search for a contract by contract number.
   * If found, redirect to the contract's page.
   */

  const contractNumber = (request.query.contractNumber ?? '') as string

  if (contractNumber !== '') {
    const contracts = await getContracts(
      {
        contractNumber
      },
      {
        limit: 1,
        offset: 0
      }
    )

    if (
      contracts.count === 1 &&
      contracts.contracts[0].contractNumber === contractNumber
    ) {
      response.redirect(`/contracts/${contracts.contracts[0].contractId}`)
      return
    }
  }

  const cemeteries = getCachedCemeteries()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const contractTypes = getCachedContractTypes()
  const funeralHomes = getFuneralHomes()
  const feeCategories = getFeeCategories({}, { includeFees: true })
  const serviceTypes = getCachedServiceTypes()

  const unprocessedOrderFormCount = getConfigProperty(
    'integrations.portal.integrationIsEnabled'
  )
    ? getUnprocessedOrderFormCount()
    : 0

  response.render('contracts/search', {
    headTitle: i18next.t('contracts.contractSearch', {
      lng: response.locals.lng
    }),

    cemeteryId: request.query.cemeteryId,
    contractNumber: request.query.contractNumber ?? '',
    deceasedName: request.query.deceasedName ?? '',

    burialSiteTypes,
    cemeteries,
    contractTypes,
    feeCategories,
    funeralHomes,
    serviceTypes,

    unprocessedOrderFormCount,

    error
  })
}
