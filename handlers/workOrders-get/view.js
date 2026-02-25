import getWorkOrder from '../../database/getWorkOrder.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
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
    response.render('workOrders/view', {
        headTitle: i18next.t('workOrders:workOrderTitle', {
            number: workOrder.workOrderNumber,
            lng: response.locals.lng
        }),
        workOrder
    });
}
