import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('ContractTypes', request.body.contractTypeId)
        : moveRecordUp('ContractTypes', request.body.contractTypeId);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
