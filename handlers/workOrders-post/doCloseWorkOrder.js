import closeWorkOrder from '../../database/closeWorkOrder.js';
export default function handler(request, response) {
    const success = closeWorkOrder(request.body, request.session.user);
    response.json({
        success
    });
}
