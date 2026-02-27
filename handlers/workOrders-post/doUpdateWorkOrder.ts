import type { Request, Response } from 'express'

import updateWorkOrder, {
  type UpdateWorkOrderForm
} from '../../database/updateWorkOrder.js'

export type DoUpdateWorkOrderResponse =
  | { errorMessage: string; success: false }
  | {
      success: true
      workOrderId: number | string
    }

export default function handler(
  request: Request<unknown, unknown, UpdateWorkOrderForm>,
  response: Response<DoUpdateWorkOrderResponse>
): void {
  const success = updateWorkOrder(request.body, request.session.user as User)

  if (!success) {
    response
      .status(400)
      .json({ errorMessage: 'Failed to update work order', success: false })
    return
  }

  response.json({
    success,
    workOrderId: request.body.workOrderId
  })
}
