import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
import { getWorkOrderWorkDayRanges } from '../../helpers/settings.helpers.js';
import { getUpcomingStatHolidays, getWorkOrderStatHolidaySettings } from '../../helpers/statHolidays.helpers.js';
export default function handler(request, response) {
    const currentDate = new Date();
    const workOrderTypes = getCachedWorkOrderTypes();
    const workOrderStatuses = getCachedWorkOrderStatuses();
    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    const workOrderWorkDayRanges = getWorkOrderWorkDayRanges();
    const workOrderStatHolidayDateStrings = getUpcomingStatHolidays(getWorkOrderStatHolidaySettings()).map((holiday) => holiday.dateString);
    const workOrder = {
        workOrderStatusId: workOrderStatuses.length > 0
            ? workOrderStatuses[0].workOrderStatusId
            : undefined,
        workOrderTypeId: workOrderTypes.length > 0 ? workOrderTypes[0].workOrderTypeId : undefined,
        workOrderOpenDate: dateToInteger(currentDate),
        workOrderOpenDateString: dateToString(currentDate)
    };
    response.render('workOrders/edit', {
        headTitle: i18next.t('workOrders.newWorkOrder', {
            lng: response.locals.lng
        }),
        workOrder,
        isCreate: true,
        workOrderMilestoneTypes,
        workOrderStatuses,
        workOrderTypes,
        workOrderWorkDayRanges,
        workOrderStatHolidayDateStrings
    });
}
