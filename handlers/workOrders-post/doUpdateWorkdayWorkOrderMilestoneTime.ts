import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getWorkOrders from '../../database/getWorkOrders.js'
import {
  type UpdateWorkOrderMilestoneTimeForm,
  updateWorkOrderMilestoneTime
} from '../../database/updateWorkOrderMilestoneTime.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    UpdateWorkOrderMilestoneTimeForm & { workdayDateString: DateString }
  >,
  response: Response
): Promise<void> {
  const success = updateWorkOrderMilestoneTime(
    request.body as UpdateWorkOrderMilestoneTimeForm,
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
