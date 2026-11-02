import type { Request, Response } from 'express'

import updateOrderFormProcessed from '../../database/updateOrderFormProcessed.js'

export type DoProcessOrderFormResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
    }

export default function handler(
  request: Request<{ orderFormId: string }>,
  response: Response<DoProcessOrderFormResponse>
): void {
  const success = updateOrderFormProcessed(
    request.params.orderFormId,
    true,
    undefined
  )

  if (!success) {
    response.status(400).json({
      success: false,
      errorMessage: 'The order form could not be marked as processed.'
    })
    return
  }

  response.json({ success: true })
}
