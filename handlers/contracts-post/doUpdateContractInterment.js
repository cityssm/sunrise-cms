import getContractInterments from '../../database/getContractInterments.js';
import updateContractInterment from '../../database/updateContractInterment.js';
export default function handler(request, response) {
    updateContractInterment(request.body, request.session.user);
    const contractInterments = getContractInterments(request.body.contractId);
    response.json({
        success: true,
        contractInterments
    });
}
