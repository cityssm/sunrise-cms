import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getWorkOrderMilestones, {
  type WorkOrderMilestoneFilters
} from '../../database/getWorkOrderMilestones.js'
import { getWorkOrderWorkDayRanges } from '../../helpers/settings.helpers.js'
import {
  getUpcomingStatHolidays,
  getWorkOrderStatHolidaySettings
} from '../../helpers/statHolidays.helpers.js'
import type { WorkOrderMilestone } from '../../types/record.types.js'

export type DoGetWorkOrderMilestonesResponse = {
  statHolidayDateStrings: string[]
  workDayRanges: Record<number, { endHour: number; startHour: number }>
  workOrderMilestones: WorkOrderMilestone[]
}

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

  const filters = request.body as WorkOrderMilestoneFilters
  const year =
    typeof filters.workOrderMilestoneYear === 'string'
      ? Number(filters.workOrderMilestoneYear)
      : (filters.workOrderMilestoneYear ?? new Date().getFullYear())
  const month =
    typeof filters.workOrderMilestoneMonth === 'string'
      ? Number(filters.workOrderMilestoneMonth)
      : (filters.workOrderMilestoneMonth ?? new Date().getMonth() + 1)

  const monthStartDate = new Date(year, month - 1, 1)
  const monthEndDate = new Date(year, month, 0)
  const monthStartDateString = dateToString(monthStartDate)
  const monthEndDateString = dateToString(monthEndDate)

  const statHolidayDateStrings = getUpcomingStatHolidays(
    getWorkOrderStatHolidaySettings(),
    monthStartDate
  )
    .filter(
      (holiday) =>
        holiday.dateString >= monthStartDateString &&
        holiday.dateString <= monthEndDateString
    )
    .map((holiday) => holiday.dateString)

  response.json({
    statHolidayDateStrings,
    workDayRanges: getWorkOrderWorkDayRanges(),
    workOrderMilestones
  })
}
