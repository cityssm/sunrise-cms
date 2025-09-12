import getCemeteries from '../../database/getCemeteries.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(request, response) {
    let error = request.query.error;
    if (error === 'workOrderIdNotFound') {
        error = 'Work Order ID not found.';
    }
    else if (error === 'workOrderNumberNotFound') {
        error = 'Work Order Number not found.';
    }
    const cemeteries = getCemeteries();
    const workOrderTypes = getCachedWorkOrderTypes();
    response.render('workOrders/search', {
        headTitle: 'Work Order Search',
        cemeteries,
        workOrderTypes,
        workOrderOpenDateString: request.query.workOrderOpenDateString ?? '',
        error
    });
}
