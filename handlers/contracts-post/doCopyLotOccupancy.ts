import type { Request, Response } from 'express'

import copyLotOccupancy from '../../database/copyLotOccupancy.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const burialSiteContractId = await copyLotOccupancy(
    request.body.burialSiteContractId as string,
    request.session.user as User
  )

  response.json({
    success: true,
    burialSiteContractId
  })
}

