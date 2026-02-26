import type { Request, Response } from 'express'

import getWorkOrderMilestones, {
  type WorkOrderMilestoneFilters
} from '../../database/getWorkOrderMilestones.js'

import type { WorkOrderMilestone } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetWorkOrderMilestonesResponse =
  { workOrderMilestones: WorkOrderMilestone[] }

export default async function handler(
  request: Request,
  response: Response<DoGetWorkOrderMilestonesResponse>
): Promise<void> {
  const workOrderMilestones = await getWorkOrderMilestones(
    request.body as WorkOrderMilestoneFilters,
    {
      includeWorkOrders: true,
      orderBy: 'date'
    }
  )

  response.json({
    workOrderMilestones
  })
}
