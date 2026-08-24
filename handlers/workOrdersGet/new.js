import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    const currentDate = new Date();
    const workOrder = {
        workOrderOpenDate: dateToInteger(currentDate),
        workOrderOpenDateString: dateToString(currentDate)
    };
    const workOrderTypes = getCachedWorkOrderTypes();
    const workOrderStatuses = getCachedWorkOrderStatuses();
    response.render('workOrders/edit', {
        headTitle: i18next.t('workOrders.newWorkOrder', {
            lng: response.locals.lng
        }),
        workOrder,
        isCreate: true,
        workOrderStatuses,
        workOrderTypes
    });
}
