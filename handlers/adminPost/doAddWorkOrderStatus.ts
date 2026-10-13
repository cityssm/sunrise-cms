import type { Request, Response } from 'express'

import { addWorkOrderStatus } from '../../database/addRecord.js'
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js'
import type { WorkOrderStatus } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddWorkOrderStatusResponse = {
  workOrderStatuses: WorkOrderStatus[]
  workOrderStatusId: number
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      orderNumber?: number | string
      workOrderStatus: string
    }
  >,
  response: Response<DoAddWorkOrderStatusResponse>
): void {
  const workOrderStatusId = addWorkOrderStatus(
    request.body.workOrderStatus,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const workOrderStatuses = getCachedWorkOrderStatuses()

  response.json({
    workOrderStatuses,
    workOrderStatusId
  })
}
