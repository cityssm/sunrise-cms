import deleteOrderForm from '../../database/deleteOrderForm.js';
export default function handler(request, response) {
    const success = deleteOrderForm(request.params.orderFormId, request.session.user);
    if (!success) {
        response.status(400).json({
            success: false,
            errorMessage: 'The order form could not be deleted.'
        });
        return;
    }
    response.json({ success: true });
}
