import type { Request, Response } from 'express'

import addBurialSiteContractTransaction, {
  type AddTransactionForm
} from '../../database/addBurialSiteContractTransaction.js'
import getBurialSiteContractTransactions from '../../database/getBurialSiteContractTransactions.js'

export default async function handler(
  request: Request<unknown, unknown, AddTransactionForm>,
  response: Response
): Promise<void> {
  await addBurialSiteContractTransaction(
    request.body,
    request.session.user as User
  )

  const burialSiteContractTransactions =
    await getBurialSiteContractTransactions(request.body.burialSiteContractId, {
      includeIntegrations: true
    })

  response.json({
    success: true,
    burialSiteContractTransactions
  })
}
