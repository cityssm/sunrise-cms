import type { Request, Response } from 'express'

import deleteWorkOrderContract from '../../database/deleteWorkOrderContract.js'
import getContracts from '../../database/getContracts.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: string; contractId: string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteWorkOrderContract(
    request.body.workOrderId,
    request.body.contractId,
    request.session.user as User
  )

  const workOrderContracts = await getContracts(
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
    workOrderContracts:
      workOrderContracts.contracts
  })
}
