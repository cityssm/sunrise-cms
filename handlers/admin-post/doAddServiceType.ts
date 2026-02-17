import type { Request, Response } from 'express'

import addServiceType from '../../database/addServiceType.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { serviceType: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  const serviceTypeId = addServiceType(
    request.body,
    request.session.user as User
  )

  const serviceTypes = getCachedServiceTypes()

  response.json({
    success: true,

    serviceTypeId,
    serviceTypes
  })
}
