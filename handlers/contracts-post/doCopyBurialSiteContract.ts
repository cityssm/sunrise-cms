import type { Request, Response } from 'express'

import copyBurialSiteContract from '../../database/copyBurialSiteContract.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteContractId: string }>,
  response: Response
): Promise<void> {
  const burialSiteContractId = await copyBurialSiteContract(
    request.body.burialSiteContractId,
    request.session.user as User
  )

  response.json({
    success: true,
    burialSiteContractId
  })
}
