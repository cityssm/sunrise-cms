import { getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const workOrderOpenDateString = request.query.workOrderOpenDateString;
    const workOrderTypes = await getWorkOrderTypes();
    response.render('workOrder-search', {
        headTitle: 'Work Order Search',
        workOrderOpenDateString,
        workOrderTypes
    });
}
