import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'

export default function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'Contracts',
    request.body.contractId,
    request.session.user as User
  )

  response.json({
    success
  })
}
