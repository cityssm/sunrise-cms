import deleteContractTypePrint from '../../database/deleteContractTypePrint.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const success = deleteContractTypePrint(request.body.contractTypeId, request.body.printEJS, request.session.user);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
