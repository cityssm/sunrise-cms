import type { Request, Response } from 'express'

import { addPaymentType } from '../../database/addRecord.js'
import { getCachedPaymentTypes } from '../../helpers/cache/paymentTypes.cache.js'
import type { PaymentType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddPaymentTypeResponse = {
  paymentTypeId: number
  paymentTypes: PaymentType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      orderNumber?: number | string
      paymentType: string
    }
  >,
  response: Response<DoAddPaymentTypeResponse>
): void {
  const paymentTypeId = addPaymentType(
    request.body.paymentType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const paymentTypes = getCachedPaymentTypes()

  response.json({
    paymentTypeId,
    paymentTypes
  })
}
