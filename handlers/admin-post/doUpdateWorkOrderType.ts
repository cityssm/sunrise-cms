import type { Request, Response } from 'express'

import { updateWorkOrderType } from '../../database/updateRecord.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import type { WorkOrderType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateWorkOrderTypeResponse = {
  success: boolean
  workOrderTypes: WorkOrderType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderTypeId: string; workOrderType: string }
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
