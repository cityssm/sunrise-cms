import getContractInterments from '../../database/getContractInterments.js';
import updateContractInterment from '../../database/updateContractInterment.js';
export default async function handler(request, response) {
    await updateContractInterment(request.body, request.session.user);
    const contractInterments = await getContractInterments(request.body.contractId);
    response.json({
        success: true,
        contractInterments
    });
}
