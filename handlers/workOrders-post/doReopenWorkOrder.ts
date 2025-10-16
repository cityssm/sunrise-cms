import type { Request, Response } from 'express'

import reopenWorkOrder from '../../database/reopenWorkOrder.js'

export default function handler(
  request: Request<unknown, unknown, { workOrderId: string }>,
  response: Response
): void {
  const success = reopenWorkOrder(
    request.body.workOrderId,
    request.session.user as User
  )

  response.json({
    success,
    workOrderId: request.body.workOrderId
  })
}
