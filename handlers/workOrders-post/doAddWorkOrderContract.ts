import type { Request, Response } from 'express'

import addWorkOrderContract from '../../database/addWorkOrderContract.js'
import getContracts from '../../database/getContracts.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; workOrderId: string; }
  >,
  response: Response
): Promise<void> {
  const success = await addWorkOrderContract(
    {
      contractId: request.body.contractId,
      workOrderId: request.body.workOrderId
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
