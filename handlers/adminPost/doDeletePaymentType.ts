import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js'
import type { PaymentType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeletePaymentTypeResponse = {
  paymentTypes: PaymentType[]
  success: boolean
}

export default function handler(
  request: Request<unknown, unknown, { paymentTypeId: string }>,
  response: Response<DoDeletePaymentTypeResponse>
): void {
  const success = deleteRecord(
    'PaymentTypes',
    request.body.paymentTypeId,
    request.session.user as User
  )

  const paymentTypes = getCachedPaymentTypes()

  response.json({
    paymentTypes,
    success
  })
}
