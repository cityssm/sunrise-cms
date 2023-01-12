import type { RequestHandler } from 'express'

import { reopenWorkOrderMilestone } from '../../helpers/lotOccupancyDB/reopenWorkOrderMilestone.js'

import { getWorkOrderMilestones } from '../../helpers/lotOccupancyDB/getWorkOrderMilestones.js'

export const handler: RequestHandler = (request, response) => {
  const success = reopenWorkOrderMilestone(
    request.body.workOrderMilestoneId,
    request.session
  )

  const workOrderMilestones = getWorkOrderMilestones(
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

export default handler
