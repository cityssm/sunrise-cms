import getContractFees from '../../database/getContractFees.js';
import updateContractFeeQuantity from '../../database/updateContractFeeQuantity.js';
export default function handler(request, response) {
    const success = updateContractFeeQuantity(request.body, request.session.user);
    const contractFees = getContractFees(request.body.contractId);
    response.json({
        success,
        contractFees
    });
}
