import deleteContractInterment from '../../database/deleteContractInterment.js';
import getContractInterments from '../../database/getContractInterments.js';
export default async function handler(request, response) {
    const success = await deleteContractInterment(request.body.contractId, request.body.intermentNumber, request.session.user);
    const contractInterments = await getContractInterments(request.body.contractId);
    response.json({
        success,
        contractInterments
    });
}
