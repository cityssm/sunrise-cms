import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderType: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  const workOrderTypeId = addRecord(
    'WorkOrderTypes',
    request.body.workOrderType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const workOrderTypes = getCachedWorkOrderTypes()

  response.json({
    success: true,
    workOrderTypeId,
    workOrderTypes
  })
}
