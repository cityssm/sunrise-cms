import type { Request, Response } from 'express'

import { updateWorkOrderType } from '../../database/updateRecord.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderTypeId: string; workOrderType: string }
  >,
  response: Response
): void {
  const success = updateWorkOrderType(
    request.body.workOrderTypeId,
    request.body.workOrderType,
    request.session.user as User
  )

  const workOrderTypes = getCachedWorkOrderTypes()

  response.json({
    success,
    workOrderTypes
  })
}
