import addWorkOrder from '../../database/addWorkOrder.js';
export default function handler(request, response) {
    const workOrderId = addWorkOrder(request.body, request.session.user);
    response.json({
        success: true,
        workOrderId
    });
}
