import addContractInterment from '../../database/addContractInterment.js';
import getContractInterments from '../../database/getContractInterments.js';
export default async function handler(request, response) {
    await addContractInterment(request.body, request.session.user);
    const contractInterments = await getContractInterments(request.body.contractId);
    response.json({
        success: true,
        contractInterments
    });
}
