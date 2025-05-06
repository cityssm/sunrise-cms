import type { Request, Response } from 'express'

import deleteRelatedContract, {
  type DeleteRelatedContractForm
} from '../../database/deleteRelatedContract.js'
import getContracts from '../../database/getContracts.js'

export default async function handler(
  request: Request<unknown, unknown, DeleteRelatedContractForm>,
  response: Response
): Promise<void> {
  deleteRelatedContract(request.body)

  const relatedContracts = await getContracts(
    {
      relatedContractId: request.body.contractId
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
    success: true,

    relatedContracts: relatedContracts.contracts
  })
}
