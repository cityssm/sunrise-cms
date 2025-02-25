import type { Request, Response } from 'express'

import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js'
import updateBurialSiteContractFeeQuantity, {
  type UpdateBurialSiteFeeForm
} from '../../database/updateBurialSiteContractFeeQuantity.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateBurialSiteFeeForm>,
  response: Response
): Promise<void> {
  const success = await updateBurialSiteContractFeeQuantity(
    request.body,
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
