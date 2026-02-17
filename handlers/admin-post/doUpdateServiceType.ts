import type { Request, Response } from 'express'

import updateServiceType from '../../database/updateServiceType.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { serviceTypeId: number | string; serviceType: string }
  >,
  response: Response
): void {
  const isSuccessful = updateServiceType(
    request.body,
    request.session.user as User
  )

  if (isSuccessful) {
    const serviceTypes = getCachedServiceTypes()

    response.json({
      success: true,
      serviceTypes
    })
  } else {
    response.json({
      success: false,
      errorMessage: 'Service Type Not Updated'
    })
  }
}
