import type { Request, Response } from 'express'

import { moveRecord } from '../../database/moveRecord.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { serviceTypeId: number | string; moveToEnd?: string | '0' | '1' }
  >,
  response: Response
): void {
  const isSuccessful = moveRecord(
    'ServiceTypes',
    request.body.serviceTypeId,
    'down',
    request.body.moveToEnd === '1'
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
      errorMessage: 'Service Type Not Moved'
    })
  }
}
