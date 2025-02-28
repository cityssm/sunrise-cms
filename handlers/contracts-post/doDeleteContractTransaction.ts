import type { Request, Response } from 'express'

import deleteContractTransaction from '../../database/deleteContractTransaction.js'
import getContractTransactions from '../../database/getContractTransactions.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; transactionIndex: number }
  >,
  response: Response
): Promise<void> {
  const success = await deleteContractTransaction(
    request.body.contractId,
    request.body.transactionIndex,
    request.session.user as User
  )

  const contractTransactions =
    await getContractTransactions(request.body.contractId, {
      includeIntegrations: true
    })

  response.json({
    success,
    contractTransactions
  })
}
