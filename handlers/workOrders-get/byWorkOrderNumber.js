import { getWorkOrderByWorkOrderNumber } from '../../database/getWorkOrder.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const workOrder = await getWorkOrderByWorkOrderNumber(request.params.workOrderNumber);
    if (workOrder === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/workOrders/?error=noWorkOrderFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/workOrders/${workOrder.workOrderId.toString()}`);
}
