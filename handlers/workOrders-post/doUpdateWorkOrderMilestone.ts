import type { Request, Response } from 'express'

import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import updateWorkOrderMilestone, {
  type UpdateWorkOrderMilestoneForm
} from '../../database/updateWorkOrderMilestone.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    UpdateWorkOrderMilestoneForm & { workOrderId: string }
  >,
  response: Response
): Promise<void> {
  const success = updateWorkOrderMilestone(
    request.body as UpdateWorkOrderMilestoneForm,
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
