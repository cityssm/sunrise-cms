import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js'
import type { WorkOrderStatus } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveWorkOrderStatusDownResponse = {
  success: boolean
  workOrderStatuses: WorkOrderStatus[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderStatusId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveWorkOrderStatusDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('WorkOrderStatuses', request.body.workOrderStatusId)
      : moveRecordDown('WorkOrderStatuses', request.body.workOrderStatusId)

  const workOrderStatuses = getCachedWorkOrderStatuses()

  response.json({
    success,
    workOrderStatuses
  })
}
