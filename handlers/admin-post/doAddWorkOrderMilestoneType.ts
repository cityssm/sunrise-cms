import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneType: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  const workOrderMilestoneTypeId = addRecord(
    'WorkOrderMilestoneTypes',
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
