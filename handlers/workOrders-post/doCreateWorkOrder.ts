import type { Request, Response } from 'express'

import addWorkOrder, {
  type AddWorkOrderForm
} from '../../database/addWorkOrder.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCreateWorkOrderResponse =
  { success: true; workOrderId: number }

export default function handler(request: Request, response: Response<DoCreateWorkOrderResponse>): void {
  const workOrderId = addWorkOrder(
    request.body as AddWorkOrderForm,
    request.session.user as User
  )

  response.json({
    success: true,
    workOrderId
  })
}
