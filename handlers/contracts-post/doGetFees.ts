import type { Request, Response } from 'express'

import getContract from '../../database/getContract.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import type { Contract } from '../../types/record.types.js'

export default async function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response
): Promise<void> {
  const contractId = request.body.contractId

  const contract = (await getContract(contractId)) as Contract

  const feeCategories = getFeeCategories(
    {
      contractTypeId: contract.contractTypeId,
      burialSiteTypeId: contract.burialSiteTypeId
    },
    {
      includeFees: true
    }
  )

  response.json({
    feeCategories
  })
}
