import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    const currentDate = new Date();
    const workOrderTypes = getCachedWorkOrderTypes();
    const workOrderStatuses = getCachedWorkOrderStatuses();
    const workOrder = {
        workOrderStatusId: workOrderStatuses.length > 0 ? workOrderStatuses[0].workOrderStatusId : undefined,
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
        workOrderStatuses,
        workOrderTypes
    });
}
