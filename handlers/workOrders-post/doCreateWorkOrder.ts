import type { Request, Response } from 'express'

import addWorkOrder, {
  type AddWorkOrderForm
} from '../../database/addWorkOrder.js'

export default function handler(request: Request, response: Response): void {
  const workOrderId = addWorkOrder(
    request.body as AddWorkOrderForm,
    request.session.user as User
  )

  response.json({
    success: true,
    workOrderId
  })
}
