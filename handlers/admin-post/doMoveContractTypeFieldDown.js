import { moveContractTypeFieldDown, moveContractTypeFieldDownToBottom } from '../../database/moveContractTypeField.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveContractTypeFieldDownToBottom(request.body.contractTypeFieldId)
        : moveContractTypeFieldDown(request.body.contractTypeFieldId);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
