import type { Request, Response } from 'express'

import updateWorkOrder, {
  type UpdateWorkOrderForm
} from '../../database/updateWorkOrder.js'

export default function handler(
  request: Request<unknown, unknown, UpdateWorkOrderForm>,
  response: Response
): void {
  const success = updateWorkOrder(request.body, request.session.user as User)

  response.json({
    success,
    workOrderId: request.body.workOrderId
  })
}
