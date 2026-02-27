import type { Request, Response } from 'express'

import deleteServiceType from '../../database/deleteServiceType.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'
import type { ServiceType } from '../../types/record.types.js'

export type DoDeleteServiceTypeResponse =
  | { success: false; errorMessage: string }
  | { success: true; serviceTypes: ServiceType[] }

export default function handler(
  request: Request<unknown, unknown, { serviceTypeId: number | string }>,
  response: Response<DoDeleteServiceTypeResponse>
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
