import type { Request, Response } from 'express'

import { updateWorkOrderType } from '../../database/updateRecord.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import type { WorkOrderType } from '../../types/record.types.js'

export type DoUpdateWorkOrderTypeResponse = {
  success: boolean
  workOrderTypes: WorkOrderType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderType: string; workOrderTypeId: string; }
  >,
  response: Response<DoUpdateWorkOrderTypeResponse>
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
