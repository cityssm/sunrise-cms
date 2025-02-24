import type { Request, Response } from 'express'

import getLotOccupancyTransactions from '../../database/getLotOccupancyTransactions.js'
import updateLotOccupancyTransaction, {
  type UpdateLotOccupancyTransactionForm
} from '../../database/updateLotOccupancyTransaction.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  await updateLotOccupancyTransaction(
    request.body as UpdateLotOccupancyTransactionForm,
    request.session.user as User
  )

  const lotOccupancyTransactions = await getLotOccupancyTransactions(
    request.body.burialSiteContractId as string,
    { includeIntegrations: true }
  )

  response.json({
    success: true,
    lotOccupancyTransactions
  })
}
