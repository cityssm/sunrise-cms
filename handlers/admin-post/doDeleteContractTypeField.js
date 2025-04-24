import { deleteRecord } from '../../database/deleteRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('ContractTypeFields', request.body.contractTypeFieldId, request.session.user);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
