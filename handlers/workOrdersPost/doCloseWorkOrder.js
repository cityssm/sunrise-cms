import closeWorkOrder from '../../database/closeWorkOrder.js';
export default function handler(request, response) {
    const success = closeWorkOrder(request.body, request.session.user);
    if (!success) {
        response.status(400).json({
            errorMessage: 'Failed to close work order',
            success: false
        });
        return;
    }
    const workOrderIdNumber = typeof request.body.workOrderId === 'string'
        ? Math.trunc(Number(request.body.workOrderId))
        : request.body.workOrderId;
    response.json({
        success,
        workOrderId: workOrderIdNumber
    });
}
