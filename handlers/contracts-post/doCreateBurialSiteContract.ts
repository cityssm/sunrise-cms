import type { Request, Response } from 'express'

import addBurialSiteContract, {
  type AddBurialSiteContractForm
} from '../../database/addBurialSiteContract.js'

export default async function handler(
  request: Request<unknown, unknown, AddBurialSiteContractForm>,
  response: Response
): Promise<void> {
  const burialSiteContractId = await addBurialSiteContract(
    request.body,
    request.session.user as User
  )

  response.json({
    success: true,
    burialSiteContractId
  })
}

