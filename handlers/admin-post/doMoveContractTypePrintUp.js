import { moveContractTypePrintUp, moveContractTypePrintUpToTop } from '../../database/moveContractTypePrintUp.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveContractTypePrintUpToTop(request.body.contractTypeId, request.body.printEJS)
        : moveContractTypePrintUp(request.body.contractTypeId, request.body.printEJS);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
