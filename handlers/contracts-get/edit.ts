import type { Request, Response } from 'express'

import getLotOccupancy from '../../database/getLotOccupancy.js'
import getMaps from '../../database/getMaps.js'
import {
  getLotOccupantTypes,
  getLotStatuses,
  getBurialSiteTypes,
  getContractTypePrintsById,
  getContractTypes,
  getWorkOrderTypes
} from '../../helpers/functions.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotOccupancy = await getLotOccupancy(request.params.burialSiteContractId)

  if (lotOccupancy === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/lotOccupancies/?error=burialSiteContractIdNotFound`
    )
    return
  }

  const ContractTypePrints = await getContractTypePrintsById(
    lotOccupancy.contractTypeId
  )

  const occupancyTypes = await getContractTypes()
  const lotOccupantTypes = await getLotOccupantTypes()
  const lotTypes = await getBurialSiteTypes()
  const lotStatuses = await getLotStatuses()
  const maps = await getMaps()
  const workOrderTypes = await getWorkOrderTypes()

  response.render('lotOccupancy-edit', {
    headTitle: `${getConfigProperty('aliases.occupancy')} Update`,
    lotOccupancy,
    ContractTypePrints,

    occupancyTypes,
    lotOccupantTypes,
    lotTypes,
    lotStatuses,
    maps,
    workOrderTypes,

    isCreate: false
  })
}
