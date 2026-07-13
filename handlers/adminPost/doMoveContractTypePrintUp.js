import { moveContractTypePrintUp, moveContractTypePrintUpToTop } from '../../database/moveContractTypePrintUp.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveContractTypePrintUpToTop(request.body.contractTypeId, request.body.printEJS)
        : moveContractTypePrintUp(request.body.contractTypeId, request.body.printEJS);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
