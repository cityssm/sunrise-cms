import type { Request, Response } from 'express'

import addWorkOrderMilestone, {
  type AddWorkOrderMilestoneForm
} from '../../database/addWorkOrderMilestone.js'
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderMilestoneForm>,
  response: Response
): Promise<void> {
  const success = addWorkOrderMilestone(
    request.body,
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
