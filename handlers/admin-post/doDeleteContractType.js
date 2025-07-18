import { deleteRecord } from '../../database/deleteRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = deleteRecord('ContractTypes', request.body.contractTypeId, request.session.user);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success,
        allContractTypeFields,
        contractTypes
    });
}
