import { type DateString, dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import { getWorkOrders } from '../../database/getWorkOrders.js'
import type { WorkOrder } from '../../types/record.types.js'

export type DoGetWorkdayReportResponse = {
  incompleteMilestoneDays: Array<{
    incompleteMilestoneCount: number
    workdayDateString: DateString
  }>
  workOrders: WorkOrder[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { cemeteryId: string; workdayDateString: DateString }
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

  const summaryResult = await getWorkOrders(
    {
      cemeteryId: request.body.cemeteryId
    },
    {
      includeMilestones: true,
      limit: -1,
      offset: 0
    }
  )

  const todayDateString = dateToString(new Date())
  const incompleteMilestoneCounts = new Map<string, number>()

  for (const workOrder of summaryResult.workOrders) {
    const workOrderMilestones = workOrder.workOrderMilestones ?? []
    for (const milestone of workOrderMilestones) {
      if (
        milestone.workOrderMilestoneCompletionDate !== null ||
        milestone.workOrderMilestoneDateString === undefined ||
        milestone.workOrderMilestoneDateString >= todayDateString
      ) {
        continue
      }

      const count =
        incompleteMilestoneCounts.get(milestone.workOrderMilestoneDateString) ??
        0
      incompleteMilestoneCounts.set(
        milestone.workOrderMilestoneDateString,
        count + 1
      )
    }
  }

  const incompleteMilestoneDayEntries = Array.from(
    incompleteMilestoneCounts,
    ([workdayDateString, incompleteMilestoneCount]) =>
      [workdayDateString, incompleteMilestoneCount] as [string, number]
  )

  const incompleteMilestoneDays = incompleteMilestoneDayEntries
    .toSorted(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([workdayDateString, incompleteMilestoneCount]) => ({
      incompleteMilestoneCount,
      workdayDateString: workdayDateString as DateString
    }))

  response.json({
    incompleteMilestoneDays,
    workOrders: result.workOrders
  })
}
