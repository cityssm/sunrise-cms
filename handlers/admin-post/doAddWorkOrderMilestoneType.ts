import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getWorkOrderMilestoneTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneType: string; orderNumber?: number | string }
  >,
  response: Response
): Promise<void> {
  const workOrderMilestoneTypeId = await addRecord(
    'WorkOrderMilestoneTypes',
    request.body.workOrderMilestoneType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const workOrderMilestoneTypes = await getWorkOrderMilestoneTypes()

  response.json({
    success: true,
    workOrderMilestoneTypeId,
    workOrderMilestoneTypes
  })
}
