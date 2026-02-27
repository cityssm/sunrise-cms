import type { Request, Response } from 'express'

import closeWorkOrder, {
  type CloseWorkOrderForm
} from '../../database/closeWorkOrder.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCloseWorkOrderResponse =
  { success: boolean; workOrderId: number | undefined }

export default function handler(
  request: Request<unknown, unknown, CloseWorkOrderForm>,
  response: Response<DoCloseWorkOrderResponse>
): void {
  const success = closeWorkOrder(request.body, request.session.user as User)

  const workOrderIdNumber =
    typeof request.body.workOrderId === 'string'
      ? Number.parseInt(request.body.workOrderId, 10)
      : request.body.workOrderId

  response.json({
    success,

    workOrderId: success ? workOrderIdNumber : undefined
  })
}
