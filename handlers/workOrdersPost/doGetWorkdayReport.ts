import { dateToString, type DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import { getWorkOrders } from '../../database/getWorkOrders.js'
import type { WorkOrder } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetWorkdayReportResponse = {
  incompleteMilestoneDays: Array<{
    workdayDateString: DateString
    incompleteMilestoneCount: number
  }>
  workOrders: WorkOrder[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workdayDateString: DateString; cemeteryId: string }
  >,
  response: Response<DoGetWorkdayReportResponse>
): Promise<void> {
  const result = await getWorkOrders(
    {
      cemeteryId: request.body.cemeteryId,
      workOrderMilestoneDateString: request.body.workdayDateString
    },
    {
      limit: -1,
      offset: 0,

      includeBurialSites: true,
      includeMilestones: true
    }
  )

  const todayDateString = dateToString(new Date())
  const incompleteMilestoneCounts = new Map<string, number>()

  for (const workOrder of result.workOrders) {
    for (const milestone of workOrder.workOrderMilestones ?? []) {
      if (
        milestone.workOrderMilestoneCompletionDate === null &&
        milestone.workOrderMilestoneDateString !== undefined &&
        milestone.workOrderMilestoneDateString < todayDateString
      ) {
        const count =
          incompleteMilestoneCounts.get(
            milestone.workOrderMilestoneDateString
          ) ?? 0
        incompleteMilestoneCounts.set(
          milestone.workOrderMilestoneDateString,
          count + 1
        )
      }
    }
  }

  const incompleteMilestoneDays = [...incompleteMilestoneCounts.entries()]
    .toSorted(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([workdayDateString, incompleteMilestoneCount]) => ({
      workdayDateString: workdayDateString as DateString,
      incompleteMilestoneCount
    }))

  response.json({
    incompleteMilestoneDays,
    workOrders: result.workOrders
  })
}
