import addContractTypePrint from '../../database/addContractTypePrint.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = addContractTypePrint(request.body, request.session.user);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
