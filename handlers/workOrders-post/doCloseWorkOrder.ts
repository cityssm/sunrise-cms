import type { Request, Response } from 'express'

import closeWorkOrder, {
  type CloseWorkOrderForm
} from '../../database/closeWorkOrder.js'

export default async function handler(
  request: Request<unknown, unknown, CloseWorkOrderForm>,
  response: Response
): Promise<void> {
  const success = await closeWorkOrder(
    request.body,
    request.session.user as User
  )

  response.json({
    success
  })
}
