import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import completeWorkOrderMilestone from '../../database/completeWorkOrderMilestone.js'
import getWorkOrders from '../../database/getWorkOrders.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workdayDateString: DateString; workOrderMilestoneId: string }
  >,
  response: Response
): Promise<void> {
  const success = completeWorkOrderMilestone(
    {
      workOrderMilestoneId: request.body.workOrderMilestoneId
    },
    request.session.user as User
  )

  const result = await getWorkOrders(
    {
      workOrderMilestoneDateString: request.body.workdayDateString
    },
    {
      limit: -1,
      offset: 0,

      includeBurialSites: true,
      includeMilestones: true
    }
  )

  response.json({
    success,
    workOrders: result.workOrders
  })
}
