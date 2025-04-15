import type { Request, Response } from 'express'

import getContract from '../../database/getContract.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getContractTypePrintsById } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const contract = await getContract(
    request.params.contractId
  )

  if (contract === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/contracts/?error=contractIdNotFound`
    )
    return
  }

  const contractTypePrints = await getContractTypePrintsById(
    contract.contractTypeId
  )

  response.render('contract-view', {
    headTitle: `Contract #${contract.contractId.toString()}`,
    
    contract,
    contractTypePrints
  })
}
