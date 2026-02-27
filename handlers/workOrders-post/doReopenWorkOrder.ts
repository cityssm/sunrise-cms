import type { Request, Response } from 'express'

import reopenWorkOrder from '../../database/reopenWorkOrder.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoReopenWorkOrderResponse = {
  success: boolean
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

  response.json({
    success,
    workOrderId: request.body.workOrderId
  })
}
