import addContractInterment from '../../database/addContractInterment.js';
import getContractInterments from '../../database/getContractInterments.js';
export default function handler(request, response) {
    addContractInterment(request.body, request.session.user);
    const contractInterments = getContractInterments(request.body.contractId);
    response.json({
        success: true,
        contractInterments
    });
}
