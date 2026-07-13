import updateContract from '../../database/updateContract.js';
export default function handler(request, response) {
    const success = updateContract(request.body, request.session.user);
    response.json({
        success,
        contractId: request.body.contractId
    });
}
