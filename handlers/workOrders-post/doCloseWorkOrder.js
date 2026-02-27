import closeWorkOrder from '../../database/closeWorkOrder.js';
export default function handler(request, response) {
    const success = closeWorkOrder(request.body, request.session.user);
    const workOrderIdNumber = typeof request.body.workOrderId === 'string'
        ? Number.parseInt(request.body.workOrderId, 10)
        : request.body.workOrderId;
    response.json({
        success,
        workOrderId: success ? workOrderIdNumber : undefined
    });
}
