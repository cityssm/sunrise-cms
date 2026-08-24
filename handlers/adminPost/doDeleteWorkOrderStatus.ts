import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js'
import type { WorkOrderStatus } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteWorkOrderStatusResponse = {
  success: boolean
  workOrderStatuses: WorkOrderStatus[]
}

export default function handler(
  request: Request<unknown, unknown, { workOrderStatusId: string }>,
  response: Response<DoDeleteWorkOrderStatusResponse>
): void {
  const success = deleteRecord(
    'WorkOrderStatuses',
    request.body.workOrderStatusId,
    request.session.user as User
  )

  const workOrderStatuses = getCachedWorkOrderStatuses()

  response.json({
    success,

    workOrderStatuses
  })
}
