import { moveContractTypeFieldUp, moveContractTypeFieldUpToTop } from '../../database/moveContractTypeField.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveContractTypeFieldUpToTop(request.body.contractTypeFieldId)
        : moveContractTypeFieldUp(request.body.contractTypeFieldId);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
