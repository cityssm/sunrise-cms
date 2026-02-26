import type { Request, Response } from 'express'

import addServiceType from '../../database/addServiceType.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'

import type { ServiceType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddServiceTypeResponse =
  { success: true; serviceTypeId: number; serviceTypes: ServiceType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { serviceType: string; orderNumber?: number | string }
  >,
  response: Response<DoAddServiceTypeResponse>
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
