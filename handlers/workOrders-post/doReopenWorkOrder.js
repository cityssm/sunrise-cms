import reopenWorkOrder from '../../database/reopenWorkOrder.js';
export default function handler(request, response) {
    const success = reopenWorkOrder(request.body.workOrderId, request.session.user);
    response.json({
        success,
        workOrderId: request.body.workOrderId
    });
}
