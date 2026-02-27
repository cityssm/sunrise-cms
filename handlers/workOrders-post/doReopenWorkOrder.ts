import type { Request, Response } from 'express'

import reopenWorkOrder from '../../database/reopenWorkOrder.js'

export type DoReopenWorkOrderResponse =
  | { success: false; errorMessage: string }
  | {
      success: true
      workOrderId: string
    }

export default function handler(
  request: Request<unknown, unknown, { workOrderId: string }>,
  response: Response<DoReopenWorkOrderResponse>
): void {
  const success = reopenWorkOrder(
    request.body.workOrderId,
    request.session.user as User
  )

  if (!success) {
    response.status(400).json({
      success: false,

      errorMessage: 'Failed to reopen work order'
    })
    return
  }

  response.json({
    success,
    workOrderId: request.body.workOrderId
  })
}
