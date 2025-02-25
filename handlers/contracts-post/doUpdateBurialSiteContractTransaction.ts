import type { Request, Response } from 'express'

import getBurialSiteContractTransactions from '../../database/getBurialSiteContractTransactions.js'
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

  const burialSiteContractTransactions = await getBurialSiteContractTransactions(
    request.body.burialSiteContractId as string,
    { includeIntegrations: true }
  )

  response.json({
    success: true,
    burialSiteContractTransactions
  })
}
