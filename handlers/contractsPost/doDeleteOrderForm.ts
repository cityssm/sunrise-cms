import type { Request, Response } from 'express'

import deleteOrderForm from '../../database/deleteOrderForm.js'

export type DoDeleteOrderFormResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
    }

export default function handler(
  request: Request<{ orderFormId: string }>,
  response: Response<DoDeleteOrderFormResponse>
): void {
  const success = deleteOrderForm(request.params.orderFormId, request.session.user as User)

  if (!success) {
    response.status(400).json({
      success: false,
      errorMessage: 'The order form could not be deleted.'
    })
    return
  }

  response.json({ success: true })
}
