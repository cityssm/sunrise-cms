import type { Request, Response } from 'express'

import deleteWorkOrderBurialSiteContract from '../../database/deleteWorkOrderBurialSiteContract.js'
import getBurialSiteContracts from '../../database/getBurialSiteContracts.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: string; burialSiteContractId: string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteWorkOrderBurialSiteContract(
    request.body.workOrderId,
    request.body.burialSiteContractId,
    request.session.user as User
  )

  const workOrderBurialSiteContracts = await getBurialSiteContracts(
    {
      workOrderId: request.body.workOrderId
    },
    {
      limit: -1,
      offset: 0,
      includeInterments: true,
      includeFees: false,
      includeTransactions: false
    }
  )

  response.json({
    success,
    workOrderBurialSiteContracts:
      workOrderBurialSiteContracts.burialSiteContracts
  })
}
