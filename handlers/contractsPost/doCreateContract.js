import addContract from '../../database/addContract.js';
export default function handler(request, response) {
    const requestBody = request.body;
    const contractId = addContract(requestBody, request.session.user);
    if (requestBody.markOrderFormAsProcessed === 'true' && requestBody.sourceOrderFormId) {
        import('../../database/updateOrderFormProcessed.js').then(({ default: updateOrderFormProcessed }) => {
            updateOrderFormProcessed(requestBody.sourceOrderFormId, true);
        });
    }
    response.json({
        contractId
    });
}
