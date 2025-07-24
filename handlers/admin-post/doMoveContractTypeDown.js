import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('ContractTypes', request.body.contractTypeId)
        : moveRecordDown('ContractTypes', request.body.contractTypeId);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
