import deleteContractServiceType from '../../database/deleteContractServiceType.js';
import getContractServiceTypes from '../../database/getContractServiceTypes.js';
export default function handler(request, response) {
    const success = deleteContractServiceType(request.body.contractId, request.body.serviceTypeId, request.session.user);
    if (success) {
        const contractServiceTypes = getContractServiceTypes(request.body.contractId);
        response.json({
            success: true,
            contractServiceTypes
        });
    }
    else {
        response.json({
            success: false
        });
    }
}
