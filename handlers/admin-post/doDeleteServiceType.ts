import type { Request, Response } from 'express'

import deleteServiceType from '../../database/deleteServiceType.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, { serviceTypeId: number | string }>,
  response: Response
): void {
  const isSuccessful = deleteServiceType(
    request.body.serviceTypeId,
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
      errorMessage: 'Service Type Not Deleted'
    })
  }
}
