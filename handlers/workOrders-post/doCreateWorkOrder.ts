import type { Request, Response } from 'express'

import addWorkOrder, {
  type AddWorkOrderForm
} from '../../database/addWorkOrder.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCreateWorkOrderResponse = { workOrderId: number }

export default function handler(
  request: Request,
  response: Response<DoCreateWorkOrderResponse>
): void {
  const workOrderId = addWorkOrder(
    request.body as AddWorkOrderForm,
    request.session.user as User
  )

  response.json({
    workOrderId
  })
}
