import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import { getWorkOrders } from '../../database/getWorkOrders.js'

export default async function handler(
  request: Request<unknown, unknown, { workdayDateString: DateString }>,
  response: Response
): Promise<void> {
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
    workOrders: result.workOrders
  })
}
