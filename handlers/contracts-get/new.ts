import type { Request, Response } from 'express'

import { dateToInteger, dateToString } from '@cityssm/utils-datetime'

import getBurialSite from '../../database/getBurialSite.js'
import getFuneralHomes from '../../database/getFuneralHomes.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import {
  getCommittalTypes,
  getContractTypes,
  getIntermentContainerTypes
} from '../../helpers/functions.cache.js'
import type { Contract } from '../../types/record.types.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const startDate = new Date()

  const contract: Partial<Contract> = {
    isPreneed: false,
    contractStartDate: dateToInteger(startDate),
    contractStartDateString: dateToString(startDate),
    purchaserCity: getConfigProperty('settings.cityDefault'),
    purchaserProvince: getConfigProperty('settings.provinceDefault')
  }

  if (request.query.burialSiteId !== undefined) {
    const burialSite = await getBurialSite(request.query.burialSiteId as string)

    if (burialSite !== undefined) {
      contract.burialSiteId = burialSite.burialSiteId
      contract.burialSiteName = burialSite.burialSiteName
      contract.cemeteryId = burialSite.cemeteryId
      contract.cemeteryName = burialSite.cemeteryName
    }
  }

  const contractTypes = getContractTypes()
  const funeralHomes = getFuneralHomes()
  const committalTypes = getCommittalTypes()
  const intermentContainerTypes = getIntermentContainerTypes()

  response.render('contract-edit', {
    headTitle: 'Create a New Contract',

    contract,

    committalTypes,
    contractTypes,
    funeralHomes,
    intermentContainerTypes,

    isCreate: true
  })
}
