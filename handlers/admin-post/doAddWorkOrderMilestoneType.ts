import type { Request, Response } from 'express'

import { addWorkOrderMilestoneType } from '../../database/addRecord.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'
import type { WorkOrderMilestoneType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddWorkOrderMilestoneTypeResponse = {
  success: true
  workOrderMilestoneTypeId: number
  workOrderMilestoneTypes: WorkOrderMilestoneType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneType: string; orderNumber?: number | string }
  >,
  response: Response<DoAddWorkOrderMilestoneTypeResponse>
): void {
  const workOrderMilestoneTypeId = addWorkOrderMilestoneType(
    request.body.workOrderMilestoneType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

  response.json({
    success: true,
    workOrderMilestoneTypeId,
    workOrderMilestoneTypes
  })
}
