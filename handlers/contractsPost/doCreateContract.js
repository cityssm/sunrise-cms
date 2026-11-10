import addContract from '../../database/addContract.js';
import updateOrderFormProcessed from '../../database/updateOrderFormProcessed.js';
export default function handler(request, response) {
    const requestBody = request.body;
    const contractId = addContract(requestBody, request.session.user);
    if (requestBody.markOrderFormAsProcessed === 'true' &&
        requestBody.sourceOrderFormId) {
        updateOrderFormProcessed(requestBody.sourceOrderFormId, true, request.session.user);
    }
    response.json({
        contractId
    });
}
