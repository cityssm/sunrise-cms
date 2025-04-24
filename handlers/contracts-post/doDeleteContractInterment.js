import deleteContractInterment from '../../database/deleteContractInterment.js';
import getContractInterments from '../../database/getContractInterments.js';
export default function handler(request, response) {
    const success = deleteContractInterment(request.body.contractId, request.body.intermentNumber, request.session.user);
    const contractInterments = getContractInterments(request.body.contractId);
    response.json({
        success,
        contractInterments
    });
}
