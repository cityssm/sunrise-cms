import { dateToString } from '@cityssm/utils-datetime';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
import { getWorkOrderWorkDayRanges } from '../../helpers/settings.helpers.js';
import { getUpcomingStatHolidays, getWorkOrderStatHolidaySettings } from '../../helpers/statHolidays.helpers.js';
export default async function handler(request, response) {
    const workOrderMilestones = await getWorkOrderMilestones(request.body, {
        includeWorkOrders: true,
        orderBy: 'date'
    });
    const filters = request.body;
    const year = typeof filters.workOrderMilestoneYear === 'string'
        ? Number(filters.workOrderMilestoneYear)
        : (filters.workOrderMilestoneYear ?? new Date().getFullYear());
    const month = typeof filters.workOrderMilestoneMonth === 'string'
        ? Number(filters.workOrderMilestoneMonth)
        : (filters.workOrderMilestoneMonth ?? new Date().getMonth() + 1);
    const monthStartDate = new Date(year, month - 1, 1);
    const monthEndDate = new Date(year, month, 0);
    const monthStartDateString = dateToString(monthStartDate);
    const monthEndDateString = dateToString(monthEndDate);
    const statHolidayDateStrings = getUpcomingStatHolidays(getWorkOrderStatHolidaySettings(), monthStartDate)
        .filter((holiday) => holiday.dateString >= monthStartDateString &&
        holiday.dateString <= monthEndDateString)
        .map((holiday) => holiday.dateString);
    response.json({
        statHolidayDateStrings,
        workDayRanges: getWorkOrderWorkDayRanges(),
        workOrderMilestones
    });
}
