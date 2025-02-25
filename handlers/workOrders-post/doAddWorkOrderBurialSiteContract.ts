import type { Request, Response } from 'express'

import addWorkOrderBurialSiteContract from '../../database/addWorkOrderBurialSiteContract.js'
import getBurialSiteContracts from '../../database/getBurialSiteContracts.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: string; burialSiteContractId: string }
  >,
  response: Response
): Promise<void> {
  const success = await addWorkOrderBurialSiteContract(
    {
      workOrderId: request.body.workOrderId,
      burialSiteContractId: request.body.burialSiteContractId
    },
    request.session.user as User
  )

  const results = await getBurialSiteContracts(
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
    workOrderBurialSiteContracts: results.burialSiteContracts
  })
}
