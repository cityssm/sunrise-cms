import type { Request, Response } from 'express'

import deleteBurialSiteContractFee from '../../database/deleteBurialSiteContractFee.js'
import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteContractId: string; feeId: string }
  >,
  response: Response
): Promise<void> {
  const success = await deleteBurialSiteContractFee(
    request.body.burialSiteContractId,
    request.body.feeId,
    request.session.user as User
  )

  const burialSiteContractFees = await getBurialSiteContractFees(
    request.body.burialSiteContractId
  )

  response.json({
    success,
    burialSiteContractFees
  })
}
