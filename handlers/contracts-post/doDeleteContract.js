import { deleteRecord } from '../../database/deleteRecord.js';
export default async function handler(request, response) {
    const success = await deleteRecord('Contracts', request.body.contractId, request.session.user);
    response.json({
        success
    });
}
