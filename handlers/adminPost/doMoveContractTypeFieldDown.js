import { moveContractTypeFieldDown, moveContractTypeFieldDownToBottom } from '../../database/moveContractTypeField.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveContractTypeFieldDownToBottom(request.body.contractTypeFieldId)
        : moveContractTypeFieldDown(request.body.contractTypeFieldId);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
