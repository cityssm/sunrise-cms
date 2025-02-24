import type { Request, Response } from 'express'

import getBurialSiteContracts from '../../database/getLotOccupancies.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const result = await getBurialSiteContracts(request.body, {
    limit: request.body.limit,
    offset: request.body.offset,
    includeOccupants: true,
    includeFees: true,
    includeTransactions: true
  })

  response.json({
    count: result.count,
    offset: Number.parseInt(request.body.offset, 10),
    lotOccupancies: result.lotOccupancies
  })
}
