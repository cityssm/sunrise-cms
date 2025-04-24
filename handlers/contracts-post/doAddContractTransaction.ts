import type { Request, Response } from 'express'

import addContractTransaction, {
  type AddTransactionForm
} from '../../database/addContractTransaction.js'
import getContractTransactions from '../../database/getContractTransactions.js'

export default async function handler(
  request: Request<unknown, unknown, AddTransactionForm>,
  response: Response
): Promise<void> {
  addContractTransaction(request.body, request.session.user as User)

  const contractTransactions = await getContractTransactions(
    request.body.contractId,
    {
      includeIntegrations: true
    }
  )

  response.json({
    success: true,

    contractTransactions
  })
}
