import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = deleteRecord(
    'WorkOrderMilestones',
    request.body.workOrderMilestoneId as string,
    request.session.user as User
  )

  const workOrderMilestones = await getWorkOrderMilestones(
    {
      workOrderId: request.body.workOrderId as string
    },
    {
      orderBy: 'completion'
    }
  )

  response.json({
    success,
    workOrderMilestones
  })
}
