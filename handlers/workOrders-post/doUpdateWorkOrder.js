import updateWorkOrder from '../../database/updateWorkOrder.js';
export default function handler(request, response) {
    const success = updateWorkOrder(request.body, request.session.user);
    if (!success) {
        response
            .status(400)
            .json({ errorMessage: 'Failed to update work order', success: false });
        return;
    }
    response.json({
        success,
        workOrderId: request.body.workOrderId
    });
}
