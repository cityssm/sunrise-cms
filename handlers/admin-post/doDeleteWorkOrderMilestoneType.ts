import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getWorkOrderMilestoneTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, { workOrderMilestoneTypeId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'WorkOrderMilestoneTypes',
    request.body.workOrderMilestoneTypeId,
    request.session.user as User
  )

  const workOrderMilestoneTypes = getWorkOrderMilestoneTypes()

  response.json({
    success,
    
    workOrderMilestoneTypes
  })
}
