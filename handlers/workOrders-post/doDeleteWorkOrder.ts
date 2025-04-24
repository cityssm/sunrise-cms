import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'

export default function handler(
  request: Request<unknown, unknown, { workOrderId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'WorkOrders',
    request.body.workOrderId,
    request.session.user as User
  )

  response.json({
    success
  })
}
