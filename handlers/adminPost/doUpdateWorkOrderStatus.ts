import type { Request, Response } from 'express'

import { updateWorkOrderStatus } from '../../database/updateRecord.js'
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js'
import type { WorkOrderStatus } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateWorkOrderStatusResponse = {
  success: boolean
  workOrderStatuses: WorkOrderStatus[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderStatusId: string; workOrderStatus: string }
  >,
  response: Response<DoUpdateWorkOrderStatusResponse>
): void {
  const success = updateWorkOrderStatus(
    request.body.workOrderStatusId,
    request.body.workOrderStatus,
    request.session.user as User
  )

  const workOrderStatuses = getCachedWorkOrderStatuses()

  response.json({
    success,
    workOrderStatuses
  })
}
