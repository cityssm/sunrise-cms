import type { Request, Response } from 'express'

import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import reopenWorkOrderMilestone from '../../database/reopenWorkOrderMilestone.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = reopenWorkOrderMilestone(
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
