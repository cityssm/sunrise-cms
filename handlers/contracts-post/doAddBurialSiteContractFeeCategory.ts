import type { Request, Response } from 'express'

import addBurialSiteContractFeeCategory, {
  type AddBurialSiteContractCategoryForm
} from '../../database/addBurialSiteContractFeeCategory.js'
import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js'

export default async function handler(
  request: Request<unknown, unknown, AddBurialSiteContractCategoryForm>,
  response: Response
): Promise<void> {
  await addBurialSiteContractFeeCategory(
    request.body,
    request.session.user as User
  )

  const burialSiteContractFees = await getBurialSiteContractFees(
    request.body.burialSiteContractId as string
  )

  response.json({
    success: true,
    burialSiteContractFees
  })
}
