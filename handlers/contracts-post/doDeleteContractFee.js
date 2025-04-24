import deleteContractFee from '../../database/deleteContractFee.js';
import getContractFees from '../../database/getContractFees.js';
export default function handler(request, response) {
    const success = deleteContractFee(request.body.contractId, request.body.feeId, request.session.user);
    const contractFees = getContractFees(request.body.contractId);
    response.json({
        success,
        contractFees
    });
}
