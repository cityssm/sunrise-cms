import type { Request, Response } from 'express'

import updateBurialSiteContract, {
  type UpdateBurialSiteContractForm
} from '../../database/updateBurialSiteContract.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateBurialSiteContractForm>,
  response: Response
): Promise<void> {
  const success = await updateBurialSiteContract(
    request.body,
    request.session.user as User
  )

  response.json({
    success,
    burialSiteContractId: request.body.burialSiteContractId
  })
}
