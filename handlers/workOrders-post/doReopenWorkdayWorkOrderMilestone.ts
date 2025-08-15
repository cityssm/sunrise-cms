import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getWorkOrders from '../../database/getWorkOrders.js'
import reopenWorkOrderMilestone from '../../database/reopenWorkOrderMilestone.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workdayDateString: DateString; workOrderMilestoneId: string }
  >,
  response: Response
): Promise<void> {
  const success = reopenWorkOrderMilestone(
    request.body.workOrderMilestoneId,
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
