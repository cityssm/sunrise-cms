import addContractTypeField from '../../database/addContractTypeField.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const contractTypeFieldId = addContractTypeField(request.body, request.session.user);
    const contractTypes = getContractTypes();
    const allContractTypeFields = getAllContractTypeFields();
    response.json({
        success: true,
        allContractTypeFields,
        contractTypeFieldId,
        contractTypes
    });
}
