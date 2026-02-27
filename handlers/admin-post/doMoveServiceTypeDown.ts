import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'
import type { ServiceType } from '../../types/record.types.js'

export type DoMoveServiceTypeDownResponse =
  | { success: false; errorMessage: string }
  | { success: true; serviceTypes: ServiceType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { serviceTypeId: number | string; moveToEnd?: '0' | '1' }
  >,
  response: Response<DoMoveServiceTypeDownResponse>
): void {
  const isSuccessful =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('ServiceTypes', request.body.serviceTypeId)
      : moveRecordDown('ServiceTypes', request.body.serviceTypeId)

  if (isSuccessful) {
    const serviceTypes = getCachedServiceTypes()

    response.json({
      success: true,
      serviceTypes
    })
  } else {
    response.json({
      success: false,
      errorMessage: 'Service Type Not Moved'
    })
  }
}
