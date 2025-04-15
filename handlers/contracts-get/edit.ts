import type { Request, Response } from 'express'

import getContract from '../../database/getContract.js'
import getFuneralHomes from '../../database/getFuneralHomes.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import {
  getCommittalTypes,
  getContractTypePrintsById,
  getContractTypes,
  getIntermentContainerTypes,
  getWorkOrderTypes
} from '../../helpers/functions.cache.js'

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

  const contractTypes = await getContractTypes()
  const funeralHomes = await getFuneralHomes()
  const committalTypes = await getCommittalTypes()
  const intermentContainerTypes = await getIntermentContainerTypes()
  const workOrderTypes = await getWorkOrderTypes()

  response.render('contract-edit', {
    headTitle: 'Contract Update',

    contract,
    
    committalTypes,
    contractTypePrints,
    contractTypes,
    funeralHomes,
    intermentContainerTypes,
    workOrderTypes,

    isCreate: false
  })
}
