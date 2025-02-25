import type { Request, Response } from 'express'

import getBurialSiteContract from '../../database/getBurialSiteContract.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import type { BurialSiteContract } from '../../types/recordTypes.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteContractId: string }>,
  response: Response
): Promise<void> {
  const burialSiteContractId = request.body.burialSiteContractId

  const burialSiteContract = (await getBurialSiteContract(
    burialSiteContractId
  )) as BurialSiteContract

  const feeCategories = await getFeeCategories(
    {
      contractTypeId: burialSiteContract.contractTypeId,
      burialSiteTypeId: burialSiteContract.burialSiteTypeId
    },
    {
      includeFees: true
    }
  )

  response.json({
    feeCategories
  })
}
