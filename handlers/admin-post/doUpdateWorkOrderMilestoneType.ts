import type { Request, Response } from 'express'

import { updateWorkOrderMilestoneType } from '../../database/updateRecord.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneTypeId: string; workOrderMilestoneType: string }
  >,
  response: Response
): void {
  const success = updateWorkOrderMilestoneType(
    request.body.workOrderMilestoneTypeId,
    request.body.workOrderMilestoneType,
    request.session.user as User
  )

  const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

  response.json({
    success,
    workOrderMilestoneTypes
  })
}
