import addContractServiceType from '../../database/addContractServiceType.js';
import getContractServiceTypes from '../../database/getContractServiceTypes.js';
export default function handler(request, response) {
    const success = addContractServiceType(request.body, request.session.user);
    if (success) {
        const contractServiceTypes = getContractServiceTypes(request.body.contractId);
        response.json({
            success: true,
            contractServiceTypes
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Service Type Already Added or Invalid'
        });
    }
}
