import getWorkOrder from '../../database/getWorkOrder.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getBurialSiteStatuses, getWorkOrderMilestoneTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const workOrder = await getWorkOrder(request.params.workOrderId, {
        includeBurialSites: true,
        includeComments: true,
        includeMilestones: true
    });
    if (workOrder === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/workOrders/?error=workOrderIdNotFound`);
        return;
    }
    if (workOrder.workOrderCloseDate) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/workOrders/${workOrder.workOrderId.toString()}/?error=workOrderIsClosed`);
        return;
    }
    const workOrderTypes = getWorkOrderTypes();
    const workOrderMilestoneTypes = getWorkOrderMilestoneTypes();
    const burialSiteStatuses = getBurialSiteStatuses();
    response.render('workOrder-edit', {
        headTitle: `Work Order #${workOrder.workOrderNumber}`,
        workOrder,
        burialSiteStatuses,
        isCreate: false,
        workOrderMilestoneTypes,
        workOrderTypes
    });
}
