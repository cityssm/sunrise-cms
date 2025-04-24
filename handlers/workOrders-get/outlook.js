import { getWorkOrderMilestoneTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const workOrderTypes = getWorkOrderTypes();
    const workOrderMilestoneTypes = getWorkOrderMilestoneTypes();
    response.render('workOrder-outlook', {
        headTitle: 'Work Order Outlook Integration',
        workOrderMilestoneTypes,
        workOrderTypes
    });
}
