import updateWorkOrder from '../../database/updateWorkOrder.js';
export default function handler(request, response) {
    const success = updateWorkOrder(request.body, request.session.user);
    response.json({
        success,
        workOrderId: request.body.workOrderId
    });
}
