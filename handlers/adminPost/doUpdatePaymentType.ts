import type { Request, Response } from 'express'

import { updatePaymentType } from '../../database/updateRecord.js'
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js'
import type { PaymentType } from '../../types/record.types.js'

export type DoUpdatePaymentTypeResponse = {
  paymentTypes: PaymentType[]
  success: boolean
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { paymentType: string; paymentTypeId: string }
  >,
  response: Response<DoUpdatePaymentTypeResponse>
): void {
  const success = updatePaymentType(
    request.body.paymentTypeId,
    request.body.paymentType,
    request.session.user as User
  )

  const paymentTypes = getCachedPaymentTypes()

  response.json({
    paymentTypes,
    success
  })
}
