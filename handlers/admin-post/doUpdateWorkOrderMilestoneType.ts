import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import { getWorkOrderMilestoneTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneTypeId: string; workOrderMilestoneType: string }
  >,
  response: Response
): void {
  const success = updateRecord(
    'WorkOrderMilestoneTypes',
    request.body.workOrderMilestoneTypeId,
    request.body.workOrderMilestoneType,
    request.session.user as User
  )

  const workOrderMilestoneTypes = getWorkOrderMilestoneTypes()

  response.json({
    success,
    workOrderMilestoneTypes
  })
}
