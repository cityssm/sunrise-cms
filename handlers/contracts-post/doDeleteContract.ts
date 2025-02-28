import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'

export default async function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'Contracts',
    request.body.contractId,
    request.session.user as User
  )

  response.json({
    success
  })
}
