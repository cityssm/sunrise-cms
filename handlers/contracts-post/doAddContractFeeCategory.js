import addContractFeeCategory from '../../database/addContractFeeCategory.js';
import getContractFees from '../../database/getContractFees.js';
export default async function handler(request, response) {
    await addContractFeeCategory(request.body, request.session.user);
    const contractFees = getContractFees(request.body.contractId);
    response.json({
        success: true,
        contractFees
    });
}
