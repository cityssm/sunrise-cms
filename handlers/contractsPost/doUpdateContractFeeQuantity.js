import getContractFees from '../../database/getContractFees.js';
import updateContractFeeQuantity from '../../database/updateContractFeeQuantity.js';
export default function handler(request, response) {
    const success = updateContractFeeQuantity(request.body, request.session.user);
    if (!success) {
        response.status(400).json({
            success: false,
            errorMessage: 'Failed to update fee quantity'
        });
        return;
    }
    const contractFees = getContractFees(request.body.contractId);
    response.json({
        success,
        contractFees
    });
}
