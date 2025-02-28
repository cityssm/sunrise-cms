import type { Request, Response } from 'express'

import getContractTransactions from '../../database/getContractTransactions.js'
import updateContractTransaction, {
  type ContractTransactionUpdateForm
} from '../../database/updateContractTransaction.js'

export default async function handler(
  request: Request<unknown, unknown, ContractTransactionUpdateForm>,
  response: Response
): Promise<void> {
  await updateContractTransaction(
    request.body,
    request.session.user as User
  )

  const contractTransactions =
    await getContractTransactions(request.body.contractId, {
      includeIntegrations: true
    })

  response.json({
    success: true,
    contractTransactions
  })
}
