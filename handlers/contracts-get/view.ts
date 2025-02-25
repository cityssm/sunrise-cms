import type { Request, Response } from 'express'

import getBurialSiteContract from '../../database/getBurialSiteContract.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getContractTypePrintsById } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const burialSiteContract = await getBurialSiteContract(
    request.params.burialSiteContractId
  )

  if (burialSiteContract === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/contracts/?error=burialSiteContractIdNotFound`
    )
    return
  }

  const contractTypePrints = await getContractTypePrintsById(
    burialSiteContract.contractTypeId
  )

  response.render('burialSiteContract-view', {
    headTitle: 'Contract View',
    burialSiteContract,
    contractTypePrints
  })
}
