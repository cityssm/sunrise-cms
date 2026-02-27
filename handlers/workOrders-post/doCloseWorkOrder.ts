import type { Request, Response } from 'express'

import closeWorkOrder, {
  type CloseWorkOrderForm
} from '../../database/closeWorkOrder.js'

export type DoCloseWorkOrderResponse =
  | { errorMessage: string; success: false }
  | { success: true; workOrderId: number | undefined }

export default function handler(
  request: Request<unknown, unknown, CloseWorkOrderForm>,
  response: Response<DoCloseWorkOrderResponse>
): void {
  const success = closeWorkOrder(request.body, request.session.user as User)

  if (!success) {
    response.status(400).json({
      errorMessage: 'Failed to close work order',
      success: false
    })
    return
  }

  const workOrderIdNumber =
    typeof request.body.workOrderId === 'string'
      ? Number.parseInt(request.body.workOrderId, 10)
      : request.body.workOrderId

  response.json({
    success,

    workOrderId: workOrderIdNumber
  })
}
