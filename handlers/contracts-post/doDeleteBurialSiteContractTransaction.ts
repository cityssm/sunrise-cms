import type { Request, Response } from 'express'

import deleteBurialSiteContractTransaction from '../../database/deleteBurialSiteContractTransaction.js'
import getBurialSiteContractTransactions from '../../database/getBurialSiteContractTransactions.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteContractId: string; transactionIndex: number }
  >,
  response: Response
): Promise<void> {
  const success = await deleteBurialSiteContractTransaction(
    request.body.burialSiteContractId,
    request.body.transactionIndex,
    request.session.user as User
  )

  const burialSiteContractTransactions =
    await getBurialSiteContractTransactions(request.body.burialSiteContractId, {
      includeIntegrations: true
    })

  response.json({
    success,
    burialSiteContractTransactions
  })
}
