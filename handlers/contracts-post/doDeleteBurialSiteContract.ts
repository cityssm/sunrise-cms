import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteContractId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'BurialSiteContracts',
    request.body.burialSiteContractId,
    request.session.user as User
  )

  response.json({
    success
  })
}
