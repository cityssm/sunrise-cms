import { moveContractTypePrintDown, moveContractTypePrintDownToBottom } from '../../database/moveContractTypePrintDown.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveContractTypePrintDownToBottom(request.body.contractTypeId, request.body.printEJS)
        : moveContractTypePrintDown(request.body.contractTypeId, request.body.printEJS);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
