import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(request, response) {
    const workOrderTypes = getCachedWorkOrderTypes();
    let error = request.query.error;
    if (error === 'workOrderIdNotFound') {
        error = 'Work Order ID not found.';
    }
    else if (error === 'workOrderNumberNotFound') {
        error = 'Work Order Number not found.';
    }
    response.render('workOrders/search', {
        headTitle: 'Work Order Search',
        workOrderTypes,
        workOrderOpenDateString: request.query.workOrderOpenDateString ?? '',
        error
    });
}
