import type { Request, Response } from 'express'

import updateWorkOrder, {
  type UpdateWorkOrderForm
} from '../../database/updateWorkOrder.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateWorkOrderResponse =
  { success: boolean; workOrderId: number | string }

export default function handler(
  request: Request<unknown, unknown, UpdateWorkOrderForm>,
  response: Response<DoUpdateWorkOrderResponse>
): void {
  const success = updateWorkOrder(request.body, request.session.user as User)

  response.json({
    success,
    workOrderId: request.body.workOrderId
  })
}
