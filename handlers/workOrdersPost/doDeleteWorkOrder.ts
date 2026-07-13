import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteWorkOrderResponse =
  { success: boolean }

export default function handler(
  request: Request<unknown, unknown, { workOrderId: string }>,
  response: Response<DoDeleteWorkOrderResponse>
): void {
  const success = deleteRecord(
    'WorkOrders',
    request.body.workOrderId,
    request.session.user as User
  )

  response.json({
    success
  })
}
