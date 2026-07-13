import { deleteRecord } from '../../database/deleteRecord.js';
export default function handler(request, response) {
    const success = deleteRecord('WorkOrders', request.body.workOrderId, request.session.user);
    response.json({
        success
    });
}
