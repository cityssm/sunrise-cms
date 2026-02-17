import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { serviceTypeId: number | string; moveToEnd?: '0' | '1' }
  >,
  response: Response
): void {
  const isSuccessful =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('ServiceTypes', request.body.serviceTypeId)
      : moveRecordUp('ServiceTypes', request.body.serviceTypeId)

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
