import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'LotOccupancies',
    request.body.burialSiteContractId as string,
    request.session.user as User
  )

  response.json({
    success
  })
}

