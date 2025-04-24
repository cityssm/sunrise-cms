import type { Request, Response } from 'express'

import reopenWorkOrder from '../../database/reopenWorkOrder.js'

export default function handler(request: Request, response: Response): void {
  const success = reopenWorkOrder(
    request.body.workOrderId as string,
    request.session.user as User
  )

  response.json({
    success,
    workOrderId: request.body.workOrderId as string
  })
}
