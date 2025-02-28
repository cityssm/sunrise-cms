import addContractFee from '../../database/addContractFee.js';
import getContractFees from '../../database/getContractFees.js';
export default async function handler(request, response) {
    await addContractFee(request.body, request.session.user);
    const contractFees = await getContractFees(request.body.contractId);
    response.json({
        success: true,
        contractFees
    });
}
