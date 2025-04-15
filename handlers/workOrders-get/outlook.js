import { getWorkOrderMilestoneTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const workOrderTypes = await getWorkOrderTypes();
    const workOrderMilestoneTypes = await getWorkOrderMilestoneTypes();
    response.render('workOrder-outlook', {
        headTitle: 'Work Order Outlook Integration',
        workOrderMilestoneTypes,
        workOrderTypes
    });
}
