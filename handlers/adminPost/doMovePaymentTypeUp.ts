import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js'
import type { PaymentType } from '../../types/record.types.js'

export type DoMovePaymentTypeUpResponse = {
  paymentTypes: PaymentType[]
  success: boolean
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { moveToEnd: '0' | '1'; paymentTypeId: string }
  >,
  response: Response<DoMovePaymentTypeUpResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('PaymentTypes', request.body.paymentTypeId)
      : moveRecordUp('PaymentTypes', request.body.paymentTypeId)

  const paymentTypes = getCachedPaymentTypes()

  response.json({
    paymentTypes,
    success
  })
}
