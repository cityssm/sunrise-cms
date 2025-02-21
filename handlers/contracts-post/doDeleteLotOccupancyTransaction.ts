import type { Request, Response } from 'express'

import deleteLotOccupancyTransaction from '../../database/deleteLotOccupancyTransaction.js'
import getLotOccupancyTransactions from '../../database/getLotOccupancyTransactions.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteLotOccupancyTransaction(
    request.body.lotOccupancyId,
    request.body.transactionIndex,
    request.session.user as User
  )

  const lotOccupancyTransactions = await getLotOccupancyTransactions(
    request.body.lotOccupancyId,
    { includeIntegrations: true }
  )

  response.json({
    success,
    lotOccupancyTransactions
  })
}
