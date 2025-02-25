import type { Request, Response } from 'express'

import addBurialSiteContractFee, {
  type AddBurialSiteContractFeeForm
} from '../../database/addBurialSiteContractFee.js'
import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js'

export default async function handler(
  request: Request<unknown, unknown, AddBurialSiteContractFeeForm>,
  response: Response
): Promise<void> {
  await addBurialSiteContractFee(request.body, request.session.user as User)

  const burialSiteContractFees = await getBurialSiteContractFees(
    request.body.burialSiteContractId as string
  )

  response.json({
    success: true,
    burialSiteContractFees
  })
}
