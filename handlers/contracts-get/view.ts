import type { Request, Response } from 'express'

import getLotOccupancy from '../../database/getLotOccupancy.js'
import { getContractTypePrintsById } from '../../helpers/functions.cache.js'
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

  response.render('lotOccupancy-view', {
    headTitle: `${getConfigProperty('aliases.occupancy')} View`,
    lotOccupancy,
    ContractTypePrints
  })
}
