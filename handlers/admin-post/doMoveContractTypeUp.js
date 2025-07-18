import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('ContractTypes', request.body.contractTypeId)
        : moveRecordUp('ContractTypes', request.body.contractTypeId);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
