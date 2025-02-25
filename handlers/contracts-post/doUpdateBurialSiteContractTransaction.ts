import type { Request, Response } from 'express'

import getBurialSiteContractTransactions from '../../database/getBurialSiteContractTransactions.js'
import updateBurialSiteContractTransaction, {
  type BurialSiteContractTransactionUpdateForm
} from '../../database/updateBurialSiteContractTransaction.js'

export default async function handler(
  request: Request<unknown, unknown, BurialSiteContractTransactionUpdateForm>,
  response: Response
): Promise<void> {
  await updateBurialSiteContractTransaction(
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
