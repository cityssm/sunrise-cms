import type { Request, Response } from 'express'

import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import reopenWorkOrderMilestone from '../../database/reopenWorkOrderMilestone.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: string; workOrderMilestoneId: string }
  >,
  response: Response
): Promise<void> {
  const success = reopenWorkOrderMilestone(
    request.body.workOrderMilestoneId,
    request.session.user as User
  )

  const workOrderMilestones = await getWorkOrderMilestones(
    {
      workOrderId: request.body.workOrderId
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
