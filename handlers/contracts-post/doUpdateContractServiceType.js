import getContractServiceTypes from '../../database/getContractServiceTypes.js';
import updateContractServiceType from '../../database/updateContractServiceType.js';
export default function handler(request, response) {
    const success = updateContractServiceType(request.body, request.session.user);
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
            errorMessage: 'Service Type Not Updated'
        });
    }
}
