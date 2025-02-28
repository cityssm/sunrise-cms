import getContractFees from '../../database/getContractFees.js';
import updateContractFeeQuantity from '../../database/updateContractFeeQuantity.js';
export default async function handler(request, response) {
    const success = await updateContractFeeQuantity(request.body, request.session.user);
    const contractFees = await getContractFees(request.body.contractId);
    response.json({
        success,
        contractFees
    });
}
