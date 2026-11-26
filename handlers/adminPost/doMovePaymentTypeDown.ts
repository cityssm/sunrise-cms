import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js'
import type { PaymentType } from '../../types/record.types.js'

export type DoMovePaymentTypeDownResponse = {
  paymentTypes: PaymentType[]
  success: boolean
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { moveToEnd: '0' | '1'; paymentTypeId: string }
  >,
  response: Response<DoMovePaymentTypeDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('PaymentTypes', request.body.paymentTypeId)
      : moveRecordDown('PaymentTypes', request.body.paymentTypeId)

  const paymentTypes = getCachedPaymentTypes()

  response.json({
    paymentTypes,
    success
  })
}
