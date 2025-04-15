import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getWorkOrderMilestoneTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { workOrderMilestoneTypeId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'WorkOrderMilestoneTypes',
    request.body.workOrderMilestoneTypeId,
    request.session.user as User
  )

  const workOrderMilestoneTypes = await getWorkOrderMilestoneTypes()

  response.json({
    success,
    
    workOrderMilestoneTypes
  })
}
