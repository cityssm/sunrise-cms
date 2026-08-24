import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js'
import type { WorkOrderStatus } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveWorkOrderStatusUpResponse = {
  success: boolean
  workOrderStatuses: WorkOrderStatus[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderStatusId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveWorkOrderStatusUpResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('WorkOrderStatuses', request.body.workOrderStatusId)
      : moveRecordUp('WorkOrderStatuses', request.body.workOrderStatusId)

  const workOrderStatuses = getCachedWorkOrderStatuses()

  response.json({
    success,
    workOrderStatuses
  })
}
