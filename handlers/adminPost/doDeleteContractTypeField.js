import { deleteRecord } from '../../database/deleteRecord.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('ContractTypeFields', request.body.contractTypeFieldId, request.session.user);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
