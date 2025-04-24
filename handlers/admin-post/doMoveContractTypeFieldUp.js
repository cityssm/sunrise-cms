import { moveContractTypeFieldUp, moveContractTypeFieldUpToTop } from '../../database/moveContractTypeField.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveContractTypeFieldUpToTop(request.body.contractTypeFieldId)
        : moveContractTypeFieldUp(request.body.contractTypeFieldId);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
