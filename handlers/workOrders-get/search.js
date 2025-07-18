import { getWorkOrderTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const workOrderOpenDateString = request.query.workOrderOpenDateString;
    const workOrderTypes = getWorkOrderTypes();
    response.render('workOrder-search', {
        headTitle: 'Work Order Search',
        workOrderOpenDateString,
        workOrderTypes
    });
}
