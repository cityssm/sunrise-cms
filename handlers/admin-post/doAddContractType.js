import addContractType from '../../database/addContractType.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const contractTypeId = addContractType(request.body, request.session.user);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success: true,
        allContractTypeFields,
        contractTypeId,
        contractTypes
    });
}
