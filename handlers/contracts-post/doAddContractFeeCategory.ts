import type { Request, Response } from 'express'

import addContractFeeCategory, {
  type AddContractCategoryForm
} from '../../database/addContractFeeCategory.js'
import getContractFees from '../../database/getContractFees.js'

export default async function handler(
  request: Request<unknown, unknown, AddContractCategoryForm>,
  response: Response
): Promise<void> {
  await addContractFeeCategory(request.body, request.session.user as User)

  const contractFees = getContractFees(request.body.contractId as string)

  response.json({
    success: true,

    contractFees
  })
}
