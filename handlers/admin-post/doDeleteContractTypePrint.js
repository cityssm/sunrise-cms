import deleteContractTypePrint from '../../database/deleteContractTypePrint.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = deleteContractTypePrint(request.body.contractTypeId, request.body.printEJS, request.session.user);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
