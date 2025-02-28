import deleteContractFee from '../../database/deleteContractFee.js';
import getContractFees from '../../database/getContractFees.js';
export default async function handler(request, response) {
    const success = await deleteContractFee(request.body.contractId, request.body.feeId, request.session.user);
    const contractFees = await getContractFees(request.body.contractId);
    response.json({
        success,
        contractFees
    });
}
