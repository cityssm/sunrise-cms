import type { Request, Response } from 'express'

import addWorkOrderContract from '../../database/addWorkOrderContract.js'
import getContracts from '../../database/getContracts.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: string; contractId: string }
  >,
  response: Response
): Promise<void> {
  const success = await addWorkOrderContract(
    {
      workOrderId: request.body.workOrderId,
      contractId: request.body.contractId
    },
    request.session.user as User
  )

  const results = await getContracts(
    {
      workOrderId: request.body.workOrderId
    },
    {
      limit: -1,
      offset: 0,

      includeFees: false,
      includeInterments: true,
      includeTransactions: false
    }
  )

  response.json({
    success,
    workOrderContracts: results.contracts
  })
}
