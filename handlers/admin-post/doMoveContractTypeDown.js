import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('ContractTypes', request.body.contractTypeId)
        : moveRecordDown('ContractTypes', request.body.contractTypeId);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
