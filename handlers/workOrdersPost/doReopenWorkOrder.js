import reopenWorkOrder from '../../database/reopenWorkOrder.js';
export default function handler(request, response) {
    const success = reopenWorkOrder(request.body.workOrderId, request.session.user);
    if (!success) {
        response.status(400).json({
            success: false,
            errorMessage: 'Failed to reopen work order'
        });
        return;
    }
    response.json({
        success,
        workOrderId: request.body.workOrderId
    });
}
