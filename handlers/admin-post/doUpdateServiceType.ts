import type { Request, Response } from 'express'

import updateServiceType from '../../database/updateServiceType.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'

import type { ServiceType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateServiceTypeResponse =
  | { success: true; serviceTypes: ServiceType[] }
  | { success: false; errorMessage: string }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { serviceTypeId: number | string; serviceType: string }
  >,
  response: Response<DoUpdateServiceTypeResponse>
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
