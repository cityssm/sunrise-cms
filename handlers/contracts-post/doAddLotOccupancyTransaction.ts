import type { Request, Response } from 'express'

import addLotOccupancyTransaction, {
  type AddLotOccupancyTransactionForm
} from '../../database/addLotOccupancyTransaction.js'
import getLotOccupancyTransactions from '../../database/getLotOccupancyTransactions.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  await addLotOccupancyTransaction(
    request.body as AddLotOccupancyTransactionForm,
    request.session.user as User
  )

  const lotOccupancyTransactions = await getLotOccupancyTransactions(
    request.body.burialSiteContractId,
    { includeIntegrations: true }
  )

  response.json({
    success: true,
    lotOccupancyTransactions
  })
}
