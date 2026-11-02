import updateOrderFormProcessed from '../../database/updateOrderFormProcessed.js';
export default function handler(request, response) {
    const success = updateOrderFormProcessed(request.params.orderFormId, true, undefined);
    if (!success) {
        response.status(400).json({
            success: false,
            errorMessage: 'The order form could not be marked as processed.'
        });
        return;
    }
    response.json({ success: true });
}
