import { deleteRecord } from '../../database/deleteRecord.js';
export default function handler(request, response) {
    const success = deleteRecord('Contracts', request.body.contractId, request.session.user);
    response.json({
        success
    });
}
